import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true, // ✅ Confirmer que le composant est standalone
  imports: [CommonModule, RouterModule] // ✅ Ajoute ici les modules nécessaires comme CommonModule si besoin
})
export class AppComponent implements OnInit {
  title: string = 'Nature & Animaux';
  data: any[] = []; // ✅ Correction du type de `data`
  isMenuOpen: boolean = false; // ✅ Ajout d'un état pour le menu burger

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.apiService.getData('test') // ⚠️ Vérifie que cet endpoint est bien accessible
      .subscribe({
        next: (response: any) => {
          console.log('📥 Données reçues:', response);
          if (Array.isArray(response)) {
            this.data = response;
          } else {
            console.warn('⚠️ Réponse inattendue, conversion en tableau vide');
            this.data = [];
          }
        },
        error: (error) => {
          console.error('❌ Erreur lors de la requête:', error);
        }
      });
  }

  // ✅ Fonction pour afficher/cacher le menu burger
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    const menu = document.querySelector('.left-menu');
    if (menu) {
      if (this.isMenuOpen) {
        menu.classList.add('open');
      } else {
        menu.classList.remove('open');
      }
    }
  }
}
