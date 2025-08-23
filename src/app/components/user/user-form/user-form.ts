
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { UserService } from '../../../services/user.service';
import { UserStore } from '../../../store/user.store';
import { User } from '../../../models/user';

interface GenderOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly userStore = inject(UserStore);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals
  loading = signal(false);
  isEditMode = signal(false);
  userId = signal<number | null>(null);

  // Gender options
  genderOptions: GenderOption[] = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];


  // Typed Form
  userForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)]],
    age: [null as number | null, [Validators.min(1), Validators.max(120)]],
    gender: ['']
  });

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.userId.set(+params['id']);
        this.loadUserForEdit(+params['id']);
      }
    });
  }

  private loadUserForEdit(userId: number): void {
    const user = this.userStore.getUserById(userId);
    if (user) {
      this.populateForm(user);
    } else {
      // If user not in store, fetch from API
      this.userService.getUserById(userId).subscribe({
        next: (response) => {
          this.populateForm(response);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load user data',
            life: 5000
          });
          this.router.navigate(['/users']);
        }
      });
    }
  }

  private populateForm(user: any): void {
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      age: user.age || null,
      gender: user.gender || ''
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {

      return;
    }

    this.loading.set(true);

    const formValue = this.userForm.value;
    const userData = {
      name: `${formValue.firstName} ${formValue.lastName}`,
      job: 'User', // reqres.in requires job field
      phone: formValue.phone,
      age: formValue.age,
      gender: formValue.gender
    };

    if (this.isEditMode() && this.userId()) {
      this.updateUser(userData);
    } else {
      this.createUser(userData);
    }
  }

  private createUser(userData: any): void {
    this.userService.createUser(userData).subscribe({
      next: (response) => {
        // Create a mock user object for our store (since reqres.in doesn't return full user data)
        const newUser =
        {
          id: response.id,
          email: this.userForm.value.email!,
          firstName: this.userForm.value.firstName!,
          lastName: this.userForm.value.lastName!,
          phone: this.userForm.value.phone!,
          age: this.userForm.value.age!,
          gender: this.userForm.value.gender!
        };

        this.userStore.addUser(newUser);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User created successfully!',
          life: 5000
        });

        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create user',
          life: 5000
        });
        this.loading.set(false);
      }
    });
  }

  private updateUser(userData: any): void {
    if (!this.userId()) return;

    this.userService.updateUser(this.userId()!, userData).subscribe({
      next: (response) => {
        // Update user in store
        const updatedUser = {
          id: this.userId()!,
          email: this.userForm.value.email!,
          firstName: this.userForm.value.firstName!,
          lastName: this.userForm.value.lastName!,
          phone: this.userForm.value.phone || undefined,
          age: this.userForm.value.age || undefined,
          gender: this.userForm.value.gender || undefined
        };

        this.userStore.updateUser(updatedUser);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User updated successfully!',
          life: 5000
        });

        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update user',
          life: 5000
        });
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getFieldError(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Please enter a valid phone number';

    return 'Invalid field';
  }
}