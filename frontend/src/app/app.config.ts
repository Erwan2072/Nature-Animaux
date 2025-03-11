import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, Routes } from '@angular/router';
import { provideHttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AdminGuard } from './services/admin.guard';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

// ✅ Importation correcte de Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

// ✅ Définition des routes avec Lazy Loading
const updatedRoutes: Routes = [
  ...routes,
  {
    path: 'admin-products',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/admin-products/admin-products.component').then(m => m.AdminProductsComponent)
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(updatedRoutes, withComponentInputBinding()),
    provideHttpClient(),
    importProvidersFrom(
      CommonModule,
      RouterModule,
      HttpClientModule,
      MatAutocompleteModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      ReactiveFormsModule
    ),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideAnimationsAsync(),
  ],
};
