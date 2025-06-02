// auth-service.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { loginUser, RegisterUser } from '../models/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private authState = new BehaviorSubject<boolean>(this.checkToken());
  
  // Public observable for components to subscribe to
  authState$ = this.authState.asObservable();

  constructor(private httpClient: HttpClient,private router: Router // Add Router
) {}

  // Changed from private to public
  checkToken(): boolean {
    return !!localStorage.getItem('token');
  }

  postRegister(user: RegisterUser): Observable<any> {
    return this.httpClient.post(`${environment.baseurl}/Auth/register`, user);
  }

  postLogin(data: loginUser): Observable<any> {
    return this.httpClient.post(`${environment.baseurl}/Auth/Login`, data).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.authState.next(true); // Notify subscribers of login
        }
      })
    );
  }

 logout(): void {
    localStorage.removeItem('token');
    this.authState.next(false); // Notify subscribers of logout
    this.router.navigate(['/login']); // Navigate to login page
  }

  getCurrentUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.Role?.toLowerCase() || null;
    } catch (e) {
      return null;
    }
  }
}