import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountSettingService {
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.baseurl}/me/${userId}`).pipe(
      map(response => ({
        ...response,
        photoUrl: this.getPhotoFromLocalStorage(userId) || '/photo/tom.jpg'
      })),
      catchError(this.handleError)
    );
  }

  updateProfile(userId: string, data: { firstName: string; lastName: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${environment.baseurl}/me/info/${userId}`, data).pipe(
      map(response => ({
        ...response,
        photoUrl: this.getPhotoFromLocalStorage(userId) || '/photo/tom.jpg'
      })),
      catchError(this.handleError)
    );
  }

  changePassword(userId: string, data: ChangePasswordData): Observable<void> {
    return this.http.put<void>(`${environment.baseurl}/me/change-password/${userId}`, data).pipe(
      catchError(this.handleError)
    );
  }

  uploadPhoto(userId: string, photoFile: File): Observable<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    return this.http.post<{ photoUrl: string }>(`${environment.baseurl}/me/photo/${userId}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Local storage methods for photo handling
  savePhotoToLocalStorage(userId: string, photoUrl: string): void {
    try {
      localStorage.setItem(`user_${userId}_photo`, photoUrl);
    } catch (error) {
      console.error('Error saving photo to localStorage:', error);
    }
  }

  getPhotoFromLocalStorage(userId: string): string | null {
    try {
      return localStorage.getItem(`user_${userId}_photo`);
    } catch (error) {
      console.error('Error getting photo from localStorage:', error);
      return null;
    }
  }

  removePhotoFromLocalStorage(userId: string): void {
    try {
      localStorage.removeItem(`user_${userId}_photo`);
    } catch (error) {
      console.error('Error removing photo from localStorage:', error);
    }
  }
}