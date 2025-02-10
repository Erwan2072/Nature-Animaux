import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { provideRouter, RouterModule } from '@angular/router'; // ✅ Ajout de `RouterModule`
import { AdminProductsComponent } from './admin-products/admin-products.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },  // Page À propos // Page d'accueil par défaut
  { path: 'admin-products', component: AdminProductsComponent },
  { path: '**', redirectTo: '' }, // Redirige vers l'accueil en cas d'erreur
]
