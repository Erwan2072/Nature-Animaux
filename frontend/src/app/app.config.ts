import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AdminGuard } from './services/admin.guard';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

// ✅ Définition des routes, avec protection AdminGuard
const updatedRoutes: Routes = [
  ...routes, // Conserve les routes existantes
  { path: 'admin-products', component: AdminProductsComponent, canActivate: [AdminGuard] } // Ajoute la protection Admin
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(updatedRoutes, withComponentInputBinding()),
    provideHttpClient(),
    importProvidersFrom(
      CommonModule,
      RouterModule,
      MatAutocompleteModule,  // ✅ Ajout du module pour l'autocomplétion
      MatFormFieldModule,     // ✅ Ajout du module pour les champs de formulaire
      MatInputModule,          // ✅ Ajout du module pour les champs de texte
      ReactiveFormsModule,
    ),
    provideAnimationsAsync(),
  ],
};
