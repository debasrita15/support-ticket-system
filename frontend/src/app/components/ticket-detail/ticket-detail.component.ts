import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Ticket, TicketStatus } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css'
})
export class TicketDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(TicketService);
  readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  ticket: Ticket | null = null;
  isLoading = true;
  errorMessage = '';
  isCopied = false;
  isUpdatingStatus = false;
  statusSuccess = '';
  replyText = '';
  replies: {
    authorName: string;
    role: string;
    content: string;
    createdAt: Date;
  }[] = [];

  readonly statuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'Ticket ID is missing.';
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.loadTicket(Number(idParam));
  }

  loadTicket(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.ticketService.getTicketById(id).subscribe({
      next: (data) => {
        this.ticket = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.errorMessage = 'Ticket not found.';
        } else if (err.status === 403) {
          this.errorMessage = 'You are not authorized to view this ticket.';
        } else {
          this.errorMessage = 'Failed to load ticket details.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  onAdminStatusChange(event: Event): void {
    if (!this.ticket) return;

    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as TicketStatus;

    if (newStatus === this.ticket.status) return;

    this.isUpdatingStatus = true;
    this.statusSuccess = '';
    this.cdr.markForCheck();

    this.ticketService.updateTicketStatus(this.ticket.id, newStatus).subscribe({
      next: (updated) => {
        if (this.ticket) this.ticket.status = updated.status;
        this.isUpdatingStatus = false;
        this.statusSuccess = `Ticket status updated to ${newStatus}!`;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.statusSuccess = '';
          this.cdr.markForCheck();
        }, 3000);
      },
      error: () => {
        this.isUpdatingStatus = false;
        this.cdr.markForCheck();
      }
    });
  }

  copySuggestedReply(): void {
    if (!this.ticket?.suggestedReply) return;

    navigator.clipboard.writeText(this.ticket.suggestedReply).then(() => {
      this.isCopied = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.isCopied = false;
        this.cdr.markForCheck();
      }, 2500);
    });
  }

  useSuggestedReply(): void {
    if (!this.ticket?.suggestedReply) return;
    this.replyText = this.ticket.suggestedReply;
    this.cdr.markForCheck();
  }

  sendReply(): void {
    if (!this.replyText.trim()) return;
    const currentUser = this.authService.currentUser();
    this.replies.push({
      authorName: currentUser?.name || 'You',
      role: currentUser?.role || 'USER',
      content: this.replyText.trim(),
      createdAt: new Date()
    });
    this.replyText = '';
    this.cdr.markForCheck();
  }
}
