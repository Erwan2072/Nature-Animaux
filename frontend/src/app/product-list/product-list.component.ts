import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: string[] = [];
  selectedCategories: string[] = []; // ✅ Liste des catégories cochées
  errorMessage: string = '';

  // ✅ Gestion du menu burger
  burgerMenuOpen: boolean = false;
  activeMenu: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  // ✅ Récupère uniquement les produits demandés
  fetchProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data.products || [];
        this.filteredProducts = [...this.products];

        // ✅ Récupérer toutes les catégories uniques
        this.categories = [...new Set(this.products.map(p => p.category))];
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de la récupération des produits.";
        console.error("❌ Erreur API :", err);
      }
    });
  }

  // ✅ Gère le filtrage avec cases à cocher
  toggleCategoryFilter(category: string): void {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    } else {
      this.selectedCategories.push(category);
    }

    this.applyFilters();
  }

  // ✅ Applique les filtres sur les produits affichés
  applyFilters(): void {
    if (this.selectedCategories.length > 0) {
      this.filteredProducts = this.products.filter(p => this.selectedCategories.includes(p.category));
    } else {
      this.filteredProducts = [...this.products]; // Affiche tout si rien n'est coché
    }
  }

  // ✅ Optimisation *ngFor avec trackBy
  trackByProductId(index: number, product: any): string {
    return product.id;
  }

  /* === ✅ GESTION DU MENU BURGER & SOUS-MENUS === */

  // ✅ Ouvre ou ferme le menu burger
  toggleBurgerMenu(): void {
    this.burgerMenuOpen = !this.burgerMenuOpen;
    if (!this.burgerMenuOpen) {
      this.activeMenu = null; // Ferme aussi les sous-menus
    }
  }

  // ✅ Ouvre ou ferme un sous-menu spécifique
  toggleMenu(category: string): void {
    if (this.activeMenu === category) {
      this.activeMenu = null; // ✅ Ferme le menu s'il est déjà ouvert
    } else {
      this.activeMenu = category; // ✅ Ouvre le menu sélectionné
    }
  }

  // ✅ Ferme tout lorsque l'utilisateur clique en dehors
  closeMenu(): void {
    this.activeMenu = null;
    this.burgerMenuOpen = false;
  }

  // ✅ Détecte les clics en dehors du menu et le ferme automatiquement
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.category-item') &&
      !target.closest('.burger-icon') &&
      !target.closest('.burger-menu')
    ) {
      this.closeMenu();
    }
  }
}
