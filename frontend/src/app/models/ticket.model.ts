export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type TicketCategory = 'BILLING' | 'TECHNICAL' | 'ACCOUNT' | 'GENERAL';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  suggestedReply?: string;
  createdByEmail?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}
