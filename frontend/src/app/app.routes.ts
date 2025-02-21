import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { ProductListComponent } from './product-list/product-list.component';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from './services/admin.guard'; // ✅ Ajout du guard admin

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // ✅ Redirige vers home par défaut
  { path: 'home', component: HomeComponent }, // Page d'accueil
  { path: 'about', component: AboutComponent }, // Page À propos
  { path: 'products', component: ProductListComponent }, // Liste des produits
  { path: 'login', component: LoginComponent }, // Page de connexion
  {
    path: 'admin-products',
    component: AdminProductsComponent,
    canActivate: [AdminGuard] // 🔥 Protège l'accès admin
  },
  { path: '**', redirectTo: 'home' }, // Redirige toutes les erreurs vers home
];
