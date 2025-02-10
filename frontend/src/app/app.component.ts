import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router'; // ✅ Import du Router pour détecter les routes
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true, // ✅ Composant standalone
  imports: [CommonModule, RouterModule] // ✅ Modules Angular nécessaires
})
export class AppComponent implements OnInit {
  title: string = 'Nature & Animaux';
  data: any[] = []; // ✅ Stocke les produits récupérés
  isMenuOpen: boolean = false; // ✅ État du menu burger
  isAdminPage: boolean = false; // ✅ Variable pour savoir si on est sur une page admin

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.fetchProducts(); // ✅ Récupère les produits à l'initialisation

    // ✅ Vérifie si on est sur une page admin et met à jour `isAdminPage`
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAdminPage = event.url.startsWith('/admin'); // ✅ Masque les sidebars si l'URL commence par /admin
      });
  }

  // ✅ Récupérer les produits depuis l'API
  fetchProducts(): void {
    this.apiService.getProducts()
      .subscribe({
        next: (response: any) => {
          console.log('📥 Produits reçus:', response);
          this.data = Array.isArray(response) ? response : []; // ✅ Vérifie la validité de la réponse
        },
        error: (error: any) => {
          console.error('❌ Erreur lors de la requête API:', error);
        }
      });
  }

  // ✅ Fonction pour afficher/cacher le menu burger
  toggleMenu(): void {
    if (this.isAdminPage) return; // ✅ Empêche le menu de s'ouvrir en mode admin

    this.isMenuOpen = !this.isMenuOpen;
    const menu = document.querySelector('.left-menu');
    if (menu) {
      menu.classList.toggle('open', this.isMenuOpen);
    }
  }
}
