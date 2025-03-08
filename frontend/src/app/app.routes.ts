import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AdminProductsComponent } from './admin/admin-products/admin-products.component';
import { ProductListComponent } from './product-list/product-list.component';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from './services/admin.guard'; // ✅ Ajout du guard admin
import { AdminComponent } from './admin/admin.component';
import { UsersComponent } from './admin/users/users.component';
import { OrdersComponent } from './admin/orders/orders.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // ✅ Redirection vers home par défaut
  { path: 'home', component: HomeComponent }, // Page d'accueil
  { path: 'about', component: AboutComponent }, // Page À propos
  { path: 'products', component: ProductListComponent }, // Liste des produits
  { path: 'login', component: LoginComponent }, // Page de connexion
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [AdminGuard] },
  { path: 'admin/users', component: UsersComponent, canActivate: [AdminGuard] },
  { path: 'admin/orders', component: OrdersComponent, canActivate: [AdminGuard] },
  {
    path: 'admin-products',
    component: AdminProductsComponent,
    canActivate: [AdminGuard] // ✅ Protège l'accès admin
  },
  { path: '**', redirectTo: 'home' }, // Redirection en cas d'URL inconnue
];
