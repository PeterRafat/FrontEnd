import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtService } from '../service/jwt.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const jwtService = inject(JwtService);
  const token = localStorage.getItem('token');

  // Public routes
  const publicRoutes = ['/login', '/register', '/home'];
  if (publicRoutes.includes(state.url)) return true;

  // Check authentication
  if (!token || jwtService.isTokenExpired(token)) {
    router.navigate(['/login']);
    return false;
  }

  // Check authorization
  const decoded = jwtService.decodeToken(token);
  const userRole = decoded?.Role?.toLowerCase();
  const requiredRole = route.data?.['role']?.toLowerCase();

  if (requiredRole && userRole !== requiredRole) {
    router.navigate([userRole === 'teacher' ? '/teacher' : '/student']);
    return false;
  }

  return true;
};