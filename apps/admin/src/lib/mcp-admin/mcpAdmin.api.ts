import { tokenStore } from '@/lib/api';
import type { Client, ClientRegistrationResult, CreateGrant, Decision, Grant, ListResource, Page, Proposal, ProposalState, RegisterClient, ResourceMap, RotationResult, UpdateClient, UpdateGrant } from './mcpAdmin.types';

export const mcpEndpoint = `${(process.env.NEXT_PUBLIC_API_ORIGIN ?? '').replace(/\/$/, '')}/api/v1/game/content/mcp`;
let cooldownUntil = 0;
let cooldownStartedAt = 0;
const listeners = new Set<() => void>();
export const subscribeCooldown = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getCooldown = () => cooldownUntil;
export const getCooldownStart = () => cooldownStartedAt;
function setCooldown(seconds: number) {
  cooldownStartedAt = Date.now();
  cooldownUntil = Math.max(cooldownUntil, cooldownStartedAt + seconds * 1000);
  listeners.forEach(listener => listener());
}
export class McpApiError extends Error {
  constructor(public status: number, public code: string, description: string, public retryAfter = 0) { super(description); this.name = 'McpApiError'; }
}
async function request<T>(path: string, method = 'GET', body?: object): Promise<T> {
  if (cooldownUntil > Date.now()) throw new McpApiError(429, 'rate_limited', 'Please wait before trying again.', Math.ceil((cooldownUntil - Date.now()) / 1000));
  const token = tokenStore.get();
  const response = await fetch(`${mcpEndpoint}/admin${path}`, {
    method, credentials: 'omit', cache: 'no-store',
    headers: { Authorization: `Bearer ${token ?? ''}`, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const envelope = await response.json().catch(() => null);
  if (!response.ok) {
    const raw = response.headers.get('Retry-After');
    const seconds = raw && /^\d+$/.test(raw) ? Number(raw) : raw ? Math.max(0, Math.ceil((Date.parse(raw) - Date.now()) / 1000)) : 60;
    const retryAfter = Number.isFinite(seconds) ? seconds : 60;
    if (response.status === 429) setCooldown(retryAfter);
    throw new McpApiError(response.status, envelope?.error ?? 'http_error', envelope?.error_description ?? `Request failed (${response.status}).`, response.status === 429 ? retryAfter : 0);
  }
  if (envelope?.success !== true || !('payload' in envelope)) throw new McpApiError(502, 'invalid_response', 'The server returned an unexpected response. Verify the outcome before retrying.');
  return envelope.payload as T;
}
const id = encodeURIComponent;
export const listMcp = <K extends ListResource>(resource: K, page: number, state?: ProposalState) => request<Page<ResourceMap[K]>>(`/${resource}?page=${page}&limit=25${resource === 'proposals' && state ? `&state=${state}` : ''}`);
export const getProposal = (proposalId: string) => request<Proposal>(`/proposals/${id(proposalId)}`);
// Explicit DTOs keep database metadata and unexpected form fields off strict routes.
export const registerClient = (v: RegisterClient) => request<ClientRegistrationResult>('/clients', 'POST', { operationId: v.operationId, ...(v.clientId ? { clientId: v.clientId } : {}), name: v.name, kind: v.kind, confidential: v.confidential, redirectUris: v.redirectUris });
export const updateClient = (clientId: string, v: UpdateClient) => request<Client>(`/clients/${id(clientId)}`, 'PUT', { operationId: v.operationId, ...(v.name !== undefined ? { name: v.name } : {}), ...(v.redirectUris !== undefined ? { redirectUris: v.redirectUris } : {}), ...(v.isActive !== undefined ? { isActive: v.isActive } : {}) });
export const rotateClient = (clientId: string, operationId: string) => request<RotationResult>(`/clients/${id(clientId)}/rotate-secret`, 'POST', { operationId });
export const createGrant = (v: CreateGrant) => request<Grant>('/grants', 'POST', { operationId: v.operationId, clientId: v.clientId, ownerId: v.ownerId, capabilities: v.capabilities, contentTypes: v.contentTypes, settingKeys: v.settingKeys, shared: v.shared, expiresAt: v.expiresAt });
export const updateGrant = (grantId: string, v: UpdateGrant) => request<Grant>(`/grants/${id(grantId)}`, 'PUT', { operationId: v.operationId, ...(v.capabilities !== undefined ? { capabilities: v.capabilities } : {}), ...(v.contentTypes !== undefined ? { contentTypes: v.contentTypes } : {}), ...(v.settingKeys !== undefined ? { settingKeys: v.settingKeys } : {}), ...(v.shared !== undefined ? { shared: v.shared } : {}), ...(v.expiresAt !== undefined ? { expiresAt: v.expiresAt } : {}), ...(v.isActive !== undefined ? { isActive: v.isActive } : {}) });
export const revokeGrant = (grantId: string, operationId: string) => request<Grant>(`/grants/${id(grantId)}/revoke`, 'POST', { operationId });
export const decideProposal = (proposalId: string, decision: 'approve' | 'reject', v: Decision) => request<Proposal>(`/proposals/${id(proposalId)}/${decision}`, 'POST', { operationId: v.operationId, ...(v.note ? { note: v.note } : {}) });
