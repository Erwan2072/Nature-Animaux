import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export const AdminGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    map(user => !!user && user.is_admin), //  Vérifie si l'utilisateur est admin
    tap(isAdmin => {
      if (!isAdmin) {
        console.warn('Accès refusé : Vous devez être administrateur pour accéder à cette page.');
        router.navigate(['/home'], { queryParams: { unauthorized: 'true' } }); // Redirige vers la page d'accueil au lieu de login
      }
    })
  );
};
