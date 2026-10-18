import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  tickets: Ticket[] = [];
  isLoadingTickets = true;
  ticketError = '';

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoadingTickets = true;
    this.ticketError = '';
    this.cdr.markForCheck();

    this.ticketService.getMyTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.isLoadingTickets = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.ticketError = 'Could not load tickets. Please check if backend is running.';
        this.isLoadingTickets = false;
        this.cdr.markForCheck();
      }
    });
  }

  get openCount(): number {
    return this.tickets.filter(t => t.status === 'OPEN').length;
  }

  get inProgressCount(): number {
    return this.tickets.filter(t => t.status === 'IN_PROGRESS').length;
  }

  get resolvedCount(): number {
    return this.tickets.filter(t => t.status === 'RESOLVED').length;
  }

  openTicket(id: number): void {
    this.router.navigate(['/tickets', id]);
  }
}
