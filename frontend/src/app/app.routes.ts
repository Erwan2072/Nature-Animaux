import { Routes } from '@angular/router';
import { AdminGuard } from './services/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ✅ Page d'accueil
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },

  // ✅ À propos
  {
    path: 'about',
    loadComponent: () => import('./footer/about/about.component').then(m => m.AboutComponent)
  },

  // ✅ Page des produits (Liste complète)
  {
    path: 'products',
    loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent)
  },

  // ✅ Route dynamique pour les produits d'une catégorie spécifique
  {
    path: 'products/:animal/:category',
    loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent)
  },

  // ✅ Page de connexion
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },

  // ✅ Pages Admin (Protégées par `AdminGuard`)
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./admin/admin-products/admin-products.component').then(m => m.AdminProductsComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./admin/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [AdminGuard]
  },

  // ✅ Ajout des pages liées au footer avec lazy loading
  {
    path: 'terms',
    loadComponent: () => import('./footer/terms/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'legal',
    loadComponent: () => import('./footer/legal/legal.component').then(m => m.LegalComponent)
  },
  {
    path: 'support',
    loadComponent: () => import('./footer/support/support.component').then(m => m.SupportComponent)
  },

  // ✅ Redirection en cas de route inconnue
  { path: '**', redirectTo: 'home' }
];
