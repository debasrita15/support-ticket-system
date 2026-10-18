import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ticket-create.component.html',
  styleUrl: './ticket-create.component.css'
})
export class TicketCreateComponent {
  private readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);

  title = '';
  description = '';
  isSubmitting = false;
  errorMessage = '';

  onSubmit(): void {
    if (!this.title.trim() || !this.description.trim()) {
      this.errorMessage = 'Please provide both a ticket title and description.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.ticketService.createTicket({
      title: this.title.trim(),
      description: this.description.trim()
    }).subscribe({
      next: (createdTicket) => {
        this.isSubmitting = false;
        // Navigate directly to the newly created ticket detail page so user sees AI analysis
        this.router.navigate(['/tickets', createdTicket.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to submit ticket. Please check if backend is running.';
      }
    });
  }
}
