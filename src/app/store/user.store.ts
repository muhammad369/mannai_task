import { signal, computed, Injectable } from '@angular/core';
import { User } from '../models/user';

export interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class UserStore {
  // state
  private state = signal<UserState>(initialState);

  // Selectors
  users = computed(() => this.state().users);
  currentUser = computed(() => this.state().currentUser);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  // Actions
  setLoading(loading: boolean) {
    this.state.update(state => ({ ...state, loading, error: loading ? null : state.error }));
  }

  setError(error: string | null) {
    this.state.update(state => ({ ...state, error, loading: false }));
  }

  setUsers(users: User[]) {
    this.state.update(state => ({ ...state, users, loading: false, error: null }));
  }

  addUser(user: User) {
    this.state.update(state => ({
      ...state,
      users: [...state.users, user],
      loading: false,
      error: null
    }));
  }

  updateUser(updatedUser: User) {
    this.state.update(state => ({
      ...state,
      users: state.users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ),
      loading: false,
      error: null
    }));
  }


  setCurrentUser(user: User | null) {
    this.state.update(state => ({ ...state, currentUser: user }));
  }

  // Helper to get user by ID
  getUserById(id: number): User | undefined {
    return this.state().users.find(user => user.id === id);
  }
}