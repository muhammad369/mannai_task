
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { UserService } from '../../../services/user.service';
import { UserStore } from '../../../store/user.store';
import { User } from '../../../models/user';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    PaginatorModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    TagModule,
    TooltipModule,
    ToastModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
  providers: [MessageService]
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly logger = inject(LoggerService);
  private readonly userStore = inject(UserStore);
  private readonly messageService = inject(MessageService);

  // Signals
  users = this.userStore.users;
  loading = this.userStore.loading;
  error = this.userStore.error;

  // Component state
  currentPage = signal(1);
  itemsPerPage = signal(6);
  totalRecords = signal(0);
  totalPages = signal(0);


  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userStore.setLoading(true);
    
    this.userService.getUsers(this.currentPage(), this.itemsPerPage()).subscribe({
      next: (response) => {
        this.logger.info('users received:', response.users);
        this.userStore.setUsers(response.users);
        this.totalRecords.set(response.total);
        this.totalPages.set(Math.ceil(response.total/response.limit));
      },
      error: (error) => {
        this.userStore.setError('Failed to load users');
        console.error('Error loading users:', error);
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page + 1); // PrimeNG paginator is 0-based, API is 1-based
    this.loadUsers();
  }


}