'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAuthObject, me } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { useMe } from '@/lib/auth-hooks';
import { useAdminProfile } from '@tapestry/hooks';
import { getCooldown, getCooldownStart, getProposal, listMcp, McpApiError, subscribeCooldown } from './mcpAdmin.api';
import type { ListResource, OwnAuth, PermissionProfile, ProposalState } from './mcpAdmin.types';

let inFlightActions = 0;
const actionListeners = new Set<() => void>();
const subscribeActions = (listener: () => void) => { actionListeners.add(listener); return () => { actionListeners.delete(listener); }; };
const getInFlightActions = () => inFlightActions;
function changeInFlightActions(change: 1 | -1) {
  inFlightActions += change;
  actionListeners.forEach(listener => listener());
}
export function useMcpBusy() {
  return useSyncExternalStore(subscribeActions, getInFlightActions, () => 0) > 0;
}

export function useMcpPermissions() {
  const session = useMe();
  const user = session.data;
  const profile = useAdminProfile(api, user, { enabled: !!user?.profileRefs?.admin, retry: false });
  const account = useQuery({ queryKey: ['mcp-own-auth', user?._id], queryFn: async (): Promise<OwnAuth> => {
    const value: OwnAuth = await fetchAuthObject(api, user!._id);
    return { _id: value._id, email: value.email, role: value.role, permissions: value.permissions, isActive: value.isActive, isEmailVerified: value.isEmailVerified };
  }, enabled: !!user?._id, retry: false, refetchOnWindowFocus: false });
  const admin = profile.selectedProfile as PermissionProfile | undefined;
  const eligible = account.data?.isActive === true && account.data?.isEmailVerified === true;
  const elevated = account.data?.role?.includes('admin') || admin?.roles?.some(role => role === 'admin' || role === 'developer');
  const permissions = [...(account.data?.permissions ?? []), ...(admin?.permissions ?? [])];
  return { manage: eligible && !!(elevated || permissions.includes('mcp:manage')), review: eligible && !!(elevated || permissions.includes('mcp:review')), loading: session.isLoading || (!!user && account.isPending) || (!!user?.profileRefs?.admin && profile.isLoading), error: account.error ?? (profile.isError ? new Error('Your Admin profile could not be loaded. Auth account permissions are still available.') : null), account, retry: () => { void account.refetch(); if (user?.profileRefs?.admin) void profile.refetch(); } };
}
export function useMcpCooldown() {
  const until = useSyncExternalStore(subscribeCooldown, getCooldown, () => 0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (until <= Date.now()) return; const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [until]);
  return Math.max(0, Math.ceil((until - Math.max(now, getCooldownStart())) / 1000));
}
export function useMcpList<K extends ListResource>(resource: K, page: number, enabled: boolean, state?: ProposalState) {
  const cooldown = useMcpCooldown();
  return useQuery({ queryKey: ['mcp-admin', resource, page, state], queryFn: () => listMcp(resource, page, state), enabled: enabled && !cooldown, retry: false, refetchOnWindowFocus: false });
}
export function useMcpProposal(id?: string) {
  const cooldown = useMcpCooldown();
  return useQuery({ queryKey: ['mcp-admin', 'proposal', id], queryFn: () => getProposal(id!), enabled: !!id && !cooldown, retry: false, refetchOnWindowFocus: false });
}
export function mcpErrorMessage(error: unknown, record = false) {
  if (!(error instanceof McpApiError)) return 'The request could not be confirmed. Check your connection and retry explicitly.';
  if (error.status === 404) return record || error.code === 'not_found' ? 'This record could not be found.' : 'AI connections are unavailable. MCP may be disabled or not deployed on this API.';
  if (error.status === 403) return `This action is not permitted. Check account permissions and the configured admin origin. ${error.message}`;
  if (error.code === 'transactions_required') return 'The API requires transaction-capable MongoDB. Ask the operator to configure it; this form cannot repair it.';
  if (error.code === 'duplicate') return `An existing record uses this identity or key, including inactive or expired grants. Browse loaded records and additional pages to edit it. ${error.message}`;
  return error.message;
}
// Direct async handlers deliberately avoid React Query's secret-bearing mutation cache.
export function useMcpAction() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);
  const retryRef = useRef<(() => Promise<void>) | null>(null);
  const busyRef = useRef(false);
  const aliveRef = useRef(true);
  useEffect(() => { aliveRef.current = true; return () => { aliveRef.current = false; retryRef.current = null; }; }, []);
  const run = async <T,>(request: () => Promise<T>, success: (result: T) => void, conflict?: () => void, affectsContent = false) => {
    if (busyRef.current) return;
    busyRef.current = true; changeInFlightActions(1); setPending(true); setError(null); setRetryable(false);
    const attempt = () => run(request, success, conflict, affectsContent);
    try {
      const result = await request();
      // A confirmed commit must refresh metadata even if external navigation
      // unmounted the initiating form. Secret-bearing results stay out of caches.
      void queryClient.invalidateQueries({ queryKey: ['mcp-admin'] });
      if (affectsContent) {
        void queryClient.invalidateQueries({ queryKey: ['content-admin'] });
        void queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      }
      if (!aliveRef.current) return;
      retryRef.current = null; success(result);
    } catch (failure) {
      if (!aliveRef.current) return;
      let message = mcpErrorMessage(failure);
      if (failure instanceof McpApiError && failure.status === 401) {
        try { await me(api); message = `Your human session is valid. The agent connection may be revoked or expired, or your account may no longer be eligible. ${failure.message}`; }
        catch { message = 'Your human session could not be verified. Sign in again before continuing.'; }
      }
      const uncertain = !(failure instanceof McpApiError) || failure.status === 503 || failure.status === 502 || failure.status === 429;
      retryRef.current = uncertain ? attempt : null; setRetryable(uncertain); setError(message);
      if (failure instanceof McpApiError && failure.status === 409) conflict?.();
    } finally { busyRef.current = false; changeInFlightActions(-1); if (aliveRef.current) setPending(false); }
  };
  return { run, pending, error, retryable, retry: () => retryRef.current?.(), clear: () => { retryRef.current = null; setRetryable(false); setError(null); }, validation: (message: string) => { retryRef.current = null; setRetryable(false); setError(message); } };
}
