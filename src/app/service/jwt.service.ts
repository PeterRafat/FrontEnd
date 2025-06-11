import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class JwtService {
  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const decoded = this.decodeToken(token);
      if (!decoded?.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}