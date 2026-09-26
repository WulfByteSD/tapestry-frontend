import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type { ISupportTicket, ISupportMessage, ISupportGroup } from '@tapestry/types';
import { alertManager } from '@tapestry/ui';

// ─── Fetch helpers ─────────────────────────────────────────────────────────

const fetchTickets = async (api: AxiosInstance, userId: string): Promise<ISupportTicket[]> => {
  const { data } = await api.get('/support/ticket', {
    params: { filterOptions: `requester;${userId}` },
  });
  return data.payload ?? [];
};

const fetchTicket = async (api: AxiosInstance, ticketId: string): Promise<ISupportTicket> => {
  const { data } = await api.get(`/support/ticket/${ticketId}`);
  return data.payload;
};

const fetchSupportGroups = async (api: AxiosInstance): Promise<ISupportGroup[]> => {
  const { data } = await api.get('/support/support_group');
  return data.payload ?? [];
};

const fetchMessages = async (api: AxiosInstance, ticketId: string): Promise<ISupportMessage[]> => {
  const { data } = await api.get(`/support/ticket/${ticketId}/message`, {
    params: { filterOptions: `ticket;${ticketId}`, sortOptions: 'createdAt;asc' },
  });
  return data.payload ?? [];
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

export function useTickets(api: AxiosInstance, userId: string): UseQueryResult<ISupportTicket[], Error> {
  return useQuery({
    queryKey: ['support_tickets', userId],
    queryFn: () => fetchTickets(api, userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useTicket(api: AxiosInstance, ticketId: string | undefined): UseQueryResult<ISupportTicket, Error> {
  return useQuery({
    queryKey: ['support_ticket', ticketId],
    queryFn: () => fetchTicket(api, ticketId!),
    enabled: !!ticketId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useSupportGroups(api: AxiosInstance): UseQueryResult<ISupportGroup[], Error> {
  return useQuery({
    queryKey: ['support_groups'],
    queryFn: () => fetchSupportGroups(api),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

export function useTicketMessages(api: AxiosInstance, ticketId: string | undefined): UseQueryResult<ISupportMessage[], Error> {
  return useQuery({
    queryKey: ['support_messages', ticketId],
    queryFn: () => fetchMessages(api, ticketId!),
    enabled: !!ticketId,
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateTicket(api: AxiosInstance) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { subject: string; category: string[]; message: string }) => api.post('/support/ticket', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
      alertManager.addAlert('Your support ticket has been submitted.', 'success', 5000);
    },
    onError: () => {
      alertManager.addAlert('Failed to create ticket. Please try again.', 'error', 6000);
    },
  });
}

export function useSendMessage(api: AxiosInstance, ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { message: string }) => api.post(`/support/ticket/${ticketId}/message`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_messages', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support_ticket', ticketId] });
    },
    onError: () => {
      alertManager.addAlert('Failed to send message. Please try again.', 'error', 6000);
    },
  });
}
