import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, tap } from 'rxjs';

export const AdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAdmin().pipe(
    tap(isAdmin => {
      if (!isAdmin) {
        alert('🚫 Accès refusé');
        router.navigate(['/']); // 🔥 Redirige vers l'accueil si pas admin
      }
    })
  );
};
