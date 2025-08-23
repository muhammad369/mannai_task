import { Routes } from '@angular/router';
import { UserListComponent } from './components/user/user-list/user-list';

export const routes: Routes = [
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  // We'll add other routes later for detail and form components
];