import type { AxiosInstance } from 'axios';

export interface AgentSupportFeatureProps {
  api: AxiosInstance;
  userId: string;
  ticketId?: string;
}
