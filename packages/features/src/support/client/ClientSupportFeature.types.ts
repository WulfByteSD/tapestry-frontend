import type { AxiosInstance } from 'axios';

export interface ClientSupportFeatureProps {
  api: AxiosInstance;
  userId: string;
  onTicketSelect: (id: string) => void;
}

export interface ClientSupportDetailFeatureProps {
  api: AxiosInstance;
  userId: string;
  ticketId: string;
  onBack?: () => void;
}
