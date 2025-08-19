import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router'; // Ajout import Router pour navigation

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

  constructor(private apiService: ApiService, private router: Router) {} // Ajout Router

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = (data.products || []).map((product: any) => {
          // Copie image_url vers imageUrl (Angular attend imageUrl dans HTML)
          const imageUrl = product.imageUrl?.trim() !== '' ? product.imageUrl : 'assets/default-product.jpg';

          return {
            ...product,
            imageUrl: imageUrl, // Ajout clé imageUrl ici
            title: product.title?.trim() || 'Produit sans titre',
            category: product.category?.trim() || 'Catégorie inconnue',
            price: product.price ?? 'Prix non disponible'
          };
        });

        this.filteredProducts = [...this.products];

        this.categories = [...new Set(this.products.map((p: any) => p.category).filter(Boolean))];

        console.log("Produits récupérés :", this.products);
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de la récupération des produits.";
        console.error("Erreur API :", err);
      }
    });
  }


  getMinPrice(product: any): number | null {
    if (!product.variations || product.variations.length === 0) {
      return null;
    }

    const prices = product.variations
      .map((v: any) => v.price)
      .filter((p: any) => p !== null && p !== undefined);

    return prices.length > 0 ? Math.min(...prices) : null;
  }

  toggleCategoryFilter(category: string): void {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.selectedCategories.length > 0) {
      this.filteredProducts = this.products.filter(p => this.selectedCategories.includes(p.category));
    } else {
      this.filteredProducts = [...this.products];
    }
  }

  trackByProductId(index: number, product: any): string {
    return product._id || index.toString();
  }

  /* ===  GESTION DU MENU BURGER === */

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

  //  Ajout : redirection vers la page produit
  goToProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }
}
