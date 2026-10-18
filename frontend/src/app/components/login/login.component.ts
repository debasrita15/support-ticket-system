import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  isUnregistered = false;
  isLoading = false;

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      this.isUnregistered = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.isUnregistered = false;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.isUnregistered = true;
          this.errorMessage = 'No account found with this email. Please register first.';
        } else if (err.status === 401) {
          this.isUnregistered = false;
          this.errorMessage = 'Incorrect password. Please try again.';
        } else {
          this.isUnregistered = false;
          this.errorMessage = 'Login failed. Please check if backend is running.';
        }
      }
    });
  }
}
