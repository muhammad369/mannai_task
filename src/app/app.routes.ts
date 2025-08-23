import { Routes } from '@angular/router';
import { UserListComponent } from './components/user/user-list/user-list';
import { UserFormComponent } from './components/user/user-form/user-form';
import { UserDetailsComponent } from './components/user/user-details/user-details'

export const routes: Routes = [
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  { path: 'users/new', component: UserFormComponent },
  { path: 'users/edit/:id', component: UserFormComponent },
  { path: 'users/:id', component: UserDetailsComponent }, // Add this line
];