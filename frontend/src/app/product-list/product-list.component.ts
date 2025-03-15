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
  selectedCategories: string[] = [];
  errorMessage: string = '';

  burgerMenuOpen: boolean = false;
  activeMenu: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  // ✅ Récupère les produits de l'API et applique les corrections
  fetchProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = (data.products || []).map((product: any) => ({
          ...product,
          title: product.title && product.title.trim() !== '' ? product.title : 'Produit sans titre',
          category: product.category && product.category.trim() !== '' ? product.category : 'Catégorie inconnue',
          price: product.price !== undefined && product.price !== null ? product.price : 'Prix non disponible'
        }));

        this.filteredProducts = [...this.products];

        // ✅ Récupérer toutes les catégories uniques (filtrage)
        this.categories = [...new Set(this.products.map((p: any) => p.category).filter(Boolean))];

        console.log("📦 Produits récupérés :", this.products); // 🔥 Debug: Vérifie les données API
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de la récupération des produits.";
        console.error("❌ Erreur API :", err);
      }
    });
  }


  // ✅ Fonction pour récupérer le prix minimum des variations
  getMinPrice(product: any): number | null {
    if (!product.variations || product.variations.length === 0) {
      return null; // ✅ Pas de variations → prix non disponible
    }

    // ✅ On extrait les prix disponibles et on prend le minimum
    const prices = product.variations
      .map((v: any) => v.price)
      .filter((p: any) => p !== null && p !== undefined);

    return prices.length > 0 ? Math.min(...prices) : null;
  }

  // ✅ Gestion du filtrage des produits par catégorie
  toggleCategoryFilter(category: string): void {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  // ✅ Applique les filtres
  applyFilters(): void {
    if (this.selectedCategories.length > 0) {
      this.filteredProducts = this.products.filter(p => this.selectedCategories.includes(p.category));
    } else {
      this.filteredProducts = [...this.products]; // Afficher tous les produits
    }
  }

  // ✅ Optimisation *ngFor avec trackBy
  trackByProductId(index: number, product: any): string {
    return product._id || index.toString(); // ✅ MongoDB utilise `_id`
  }

  /* === ✅ GESTION DU MENU BURGER === */

  toggleBurgerMenu(): void {
    this.burgerMenuOpen = !this.burgerMenuOpen;
    if (!this.burgerMenuOpen) this.activeMenu = null;
  }

  toggleMenu(category: string): void {
    this.activeMenu = this.activeMenu === category ? null : category;
  }

  closeMenu(): void {
    this.activeMenu = null;
    this.burgerMenuOpen = false;
  }

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
