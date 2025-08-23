
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';

import { UserService } from '../../../services/user.service';
import { UserStore } from '../../../store/user.store';
import { User } from '../../../models/user';

@Component({
  selector: 'user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    ToastModule,
    DialogModule,
    TooltipModule
  ],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css'
})
export class UserDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly userStore = inject(UserStore);
  private readonly messageService = inject(MessageService);

  // Signals
  user = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  deleteDialogVisible = signal(false);
  deleting = signal(false);

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (isNaN(userId)) {
      this.error.set('Invalid user ID');
      this.loading.set(false);
      return;
    }

    // First check if user exists in store
    const cachedUser = this.userStore.getUserById(userId);
    if (cachedUser) {
      this.user.set(cachedUser);
      this.loading.set(false);
      return;
    }

    // If not in store, fetch from API
    this.loading.set(true);
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        this.user.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load user details');
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user details',
          life: 5000
        });
      }
    });
  }

  getGenderLabel(gender?: string): string {
    switch (gender) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      default: return 'Not specified';
    }
  }

  getStatusSeverity(id: number): string {
    return id % 3 === 0 ? 'success' : id % 3 === 1 ? 'warning' : 'danger';
  }

  getStatusText(id: number): string {
    return id % 3 === 0 ? 'Active' : id % 3 === 1 ? 'Pending' : 'Inactive';
  }

  onEdit(): void {
    if (this.user()) {
      this.router.navigate(['/users/edit', this.user()?.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}