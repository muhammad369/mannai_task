
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
    User,
    UserPagedResponse
} from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = 'https://dummyjson.com';

    // Get users with pagination
    getUsers(pageNo: number = 1, pageSize: number = 10): Observable<UserPagedResponse> {
        let params = new HttpParams()
            .set('skip', ((pageNo-1)*pageSize).toString())
            .set('limit', pageSize.toString());

        return this.http.get<UserPagedResponse>(`${this.apiUrl}/users`, { params });
    }

    // Get single user by ID
    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/${id}`);
    }

    // Create new user
    createUser(userData: User): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/users`, userData);
    }

    // Update user
    updateUser(id: number, userData: User): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData);
    }

    // Delete user
    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
    }
}