import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTicketRequest, Ticket, TicketStatus, UpdateTicketStatusRequest } from '../models/ticket.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tickets`;

  // Get tickets created by the logged-in user
  getMyTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/my`);
  }

  // Get single ticket by ID
  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  // Create new ticket (backend calls AI service for classification and suggested reply)
  createTicket(data: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, data);
  }

  // Admin: Get all tickets across all users
  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  // Admin: Update status of a ticket
  updateTicketStatus(id: number, status: TicketStatus): Observable<Ticket> {
    const payload: UpdateTicketStatusRequest = { status };
    return this.http.patch<Ticket>(`${this.apiUrl}/${id}/status`, payload);
  }
}
