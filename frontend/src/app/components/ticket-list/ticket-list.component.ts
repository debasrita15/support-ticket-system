import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { Ticket, TicketStatus } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.css'
})
export class TicketListComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  tickets: Ticket[] = [];
  isLoading = true;
  errorMessage = '';

  searchQuery = '';
  selectedStatus: 'ALL' | TicketStatus = 'ALL';
  selectedPriority: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' = 'ALL';

  get selectedFilter(): 'ALL' | TicketStatus {
    return this.selectedStatus;
  }
  set selectedFilter(val: 'ALL' | TicketStatus) {
    this.selectedStatus = val;
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.ticketService.getMyTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load tickets. Please check if the backend is running.';
        this.isLoading = false;
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

  get hasActiveFilters(): boolean {
    return this.selectedStatus !== 'ALL' || this.selectedPriority !== 'ALL' || !!this.searchQuery.trim();
  }

  get filteredTickets(): Ticket[] {
    return this.tickets.filter(t => {
      // 1. Status filter
      if (this.selectedStatus !== 'ALL' && t.status !== this.selectedStatus) {
        return false;
      }
      // 2. Priority filter
      if (this.selectedPriority !== 'ALL' && t.priority !== this.selectedPriority) {
        return false;
      }
      // 3. Search query
      if (this.searchQuery && this.searchQuery.trim()) {
        const query = this.searchQuery.trim().toLowerCase();
        const matchesId = t.id.toString().includes(query) || ('#' + t.id).includes(query);
        const matchesTitle = t.title ? t.title.toLowerCase().includes(query) : false;
        const matchesDesc = t.description ? t.description.toLowerCase().includes(query) : false;
        const matchesCat = t.category ? t.category.toLowerCase().includes(query) : false;
        if (!matchesId && !matchesTitle && !matchesDesc && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedPriority = 'ALL';
  }

  openTicket(id: number): void {
    this.router.navigate(['/tickets', id]);
  }
}
