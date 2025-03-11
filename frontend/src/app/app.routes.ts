import { Routes } from '@angular/router';
import { AdminGuard } from './services/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
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
  { path: '**', redirectTo: 'home' }
];
