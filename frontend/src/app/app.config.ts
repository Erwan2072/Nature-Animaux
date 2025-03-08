import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, Routes } from '@angular/router';
import { provideHttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AdminGuard } from './services/admin.guard';
import { AdminProductsComponent } from './admin/admin-products/admin-products.component';
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

// ✅ Définition des routes avec protection AdminGuard
const updatedRoutes: Routes = [
  ...routes,
  { path: 'admin-products', component: AdminProductsComponent, canActivate: [AdminGuard] }
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
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // ✅ Correction : Firebase doit être en dehors d'importProvidersFrom
    provideAuth(() => getAuth()), // ✅ Correction : Firebase Auth doit aussi être en dehors
    provideAnimationsAsync(),
  ],
};
