import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../../models/ticket.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  tickets: Ticket[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  updatingTicketId: number | null = null;

  searchQuery = '';
  selectedStatus: 'ALL' | TicketStatus = 'ALL';
  selectedPriority: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' = 'ALL';
  selectedCategory: 'ALL' | TicketCategory = 'ALL';

  readonly statuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
  readonly categories: TicketCategory[] = ['ACCOUNT', 'BILLING', 'TECHNICAL', 'GENERAL'];

  ngOnInit(): void {
    this.loadAllTickets();
  }

  loadAllTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.ticketService.getAllTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.errorMessage = 'Forbidden: You do not have administrator permissions.';
        } else {
          this.errorMessage = 'Failed to load tickets across the system.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  get filteredTickets(): Ticket[] {
    return this.tickets.filter((t) => {
      // 1. Status
      if (this.selectedStatus !== 'ALL' && t.status !== this.selectedStatus) {
        return false;
      }
      // 2. Priority
      if (this.selectedPriority !== 'ALL' && t.priority !== this.selectedPriority) {
        return false;
      }
      // 3. Category
      if (this.selectedCategory !== 'ALL' && t.category !== this.selectedCategory) {
        return false;
      }
      // 4. Search Query (ID, Title, User name, User email)
      if (this.searchQuery && this.searchQuery.trim()) {
        const query = this.searchQuery.trim().toLowerCase();
        const matchId = t.id.toString().includes(query) || ('#' + t.id).includes(query);
        const matchTitle = t.title ? t.title.toLowerCase().includes(query) : false;
        const matchUser = t.createdByName ? t.createdByName.toLowerCase().includes(query) : false;
        const matchEmail = t.createdByEmail ? t.createdByEmail.toLowerCase().includes(query) : false;
        if (!matchId && !matchTitle && !matchUser && !matchEmail) {
          return false;
        }
      }
      return true;
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

  get unresolvedCount(): number {
    return this.tickets.filter(t => t.status !== 'RESOLVED').length;
  }

  get highPriorityCount(): number {
    return this.tickets.filter(t => t.priority === 'HIGH').length;
  }

  get uniqueUsersCount(): number {
    return new Set(this.tickets.map(t => t.createdByEmail).filter(Boolean)).size;
  }

  get hasActiveFilters(): boolean {
    return this.selectedStatus !== 'ALL' || this.selectedPriority !== 'ALL' || this.selectedCategory !== 'ALL' || !!this.searchQuery.trim();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedCategory = 'ALL';
  }

  onStatusChange(ticket: Ticket, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as TicketStatus;

    if (newStatus === ticket.status) return;

    this.updatingTicketId = ticket.id;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.ticketService.updateTicketStatus(ticket.id, newStatus).subscribe({
      next: (updated) => {
        ticket.status = updated.status;
        this.updatingTicketId = null;
        this.successMessage = `Ticket #${ticket.id} status updated to ${newStatus}.`;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      },
      error: (err) => {
        this.updatingTicketId = null;
        this.errorMessage = `Failed to update status for Ticket #${ticket.id}.`;
        this.cdr.markForCheck();
      }
    });
  }

  openTicket(id: number): void {
    this.router.navigate(['/tickets', id]);
  }
}
