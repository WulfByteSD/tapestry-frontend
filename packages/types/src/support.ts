export type TicketStatus = 'new' | 'open' | 'pending' | 'on_hold' | 'solved' | 'closed';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ISupportGroup {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface ISupportTicket {
  _id: string;
  requester: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string[];
  groups: ISupportGroup[];
  createdAt: string;
  dateSolved?: string;
}

export interface ISupportMessage {
  _id: string;
  sender: {
    _id: string;
    email: string;
    role: string[];
    fullName: string;
  };
  message: string;
  createdAt: string;
}
