import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';

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
  errorMessage: string = '';

  // 🔹 Gestion des marques
  brands: string[] = [];
  selectedBrands: string[] = [];

  burgerMenuOpen: boolean = false;
  activeMenu: string | null = null;

  // 🔹 Dictionnaire de synonymes pour les recherches
  // 🔹 Dictionnaire de synonymes pour les recherches
  private categorySynonyms: { [key: string]: { category: string, animal?: string } } = {
  // 🐶 Chien
  'croquettes chien': { category: 'Alimentation sèche', animal: 'chien' },
  'croquette chien': { category: 'Alimentation sèche', animal: 'chien' },
  'alimentation sèche chien': { category: 'Alimentation sèche', animal: 'chien' },
  'alimentation chien': { category: 'Alimentation sèche', animal: 'chien' },
  'pâtée chien': { category: 'Alimentation humide', animal: 'chien' },
  'patee chien': { category: 'Alimentation humide', animal: 'chien' },
  'boîte chien': { category: 'Alimentation humide', animal: 'chien' },
  'boites chien': { category: 'Alimentation humide', animal: 'chien' },
  'friandises chien': { category: 'Friandises', animal: 'chien' },
  'gâteaux chien': { category: 'Friandises', animal: 'chien' },
  'gateaux chien': { category: 'Friandises', animal: 'chien' },
  'biscuits chien': { category: 'Friandises', animal: 'chien' },
  'accessoires chien': { category: 'Accessoires', animal: 'chien' },
  'collier chien': { category: 'Accessoires', animal: 'chien' },
  'laisse chien': { category: 'Accessoires', animal: 'chien' },
  'harnais chien': { category: 'Accessoires', animal: 'chien' },
  'gamelle chien': { category: 'Accessoires', animal: 'chien' },
  'panier chien': { category: 'Accessoires', animal: 'chien' },
  'soins chien': { category: 'Hygiènes & soins', animal: 'chien' },
  'shampoing chien': { category: 'Hygiènes & soins', animal: 'chien' },
  'shampooing chien': { category: 'Hygiènes & soins', animal: 'chien' },
  'toilettage chien': { category: 'Hygiènes & soins', animal: 'chien' },
  'hygiène chien': { category: 'Hygiènes & soins', animal: 'chien' },
  'jouets chien': { category: 'Jouets', animal: 'chien' },
  'jouet chien': { category: 'Jouets', animal: 'chien' },
  'balle chien': { category: 'Jouets', animal: 'chien' },
  'peluche chien': { category: 'Jouets', animal: 'chien' },

  // Chat
  'croquettes chat': { category: 'Alimentation sèche', animal: 'chat' },
  'croquette chat': { category: 'Alimentation sèche', animal: 'chat' },
  'alimentation sèche chat': { category: 'Alimentation sèche', animal: 'chat' },
  'alimentation chat': { category: 'Alimentation sèche', animal: 'chat' },
  'pâtée chat': { category: 'Alimentation humide', animal: 'chat' },
  'patee chat': { category: 'Alimentation humide', animal: 'chat' },
  'boîte chat': { category: 'Alimentation humide', animal: 'chat' },
  'boites chat': { category: 'Alimentation humide', animal: 'chat' },
  'friandises chat': { category: 'Friandises', animal: 'chat' },
  'gâteaux chat': { category: 'Friandises', animal: 'chat' },
  'gateaux chat': { category: 'Friandises', animal: 'chat' },
  'biscuits chat': { category: 'Friandises', animal: 'chat' },
  'accessoires chat': { category: 'Accessoires', animal: 'chat' },
  'collier chat': { category: 'Accessoires', animal: 'chat' },
  'arbre à chat': { category: 'Accessoires', animal: 'chat' },
  'litière': { category: 'Accessoires', animal: 'chat' },
  'gamelle chat': { category: 'Accessoires', animal: 'chat' },
  'panier chat': { category: 'Accessoires', animal: 'chat' },
  'soins chat': { category: 'Hygiènes & soins', animal: 'chat' },
  'shampoing chat': { category: 'Hygiènes & soins', animal: 'chat' },
  'shampooing chat': { category: 'Hygiènes & soins', animal: 'chat' },
  'toilettage chat': { category: 'Hygiènes & soins', animal: 'chat' },
  'hygiène chat': { category: 'Hygiènes & soins', animal: 'chat' },
  'jouets chat': { category: 'Jouets', animal: 'chat' },
  'jouet chat': { category: 'Jouets', animal: 'chat' },
  'balle chat': { category: 'Jouets', animal: 'chat' },
  'plumeau chat': { category: 'Jouets', animal: 'chat' },
  'laser chat': { category: 'Jouets', animal: 'chat' },

  // 🔹 Générique (tous animaux)
  'croquettes': { category: 'Alimentation sèche' },
  'croquette': { category: 'Alimentation sèche' },
  'pâtée': { category: 'Alimentation humide' },
  'patee': { category: 'Alimentation humide' },
  'friandises': { category: 'Friandises' },
  'gâteaux': { category: 'Friandises' },
  'gateaux': { category: 'Friandises' },
  'biscuits': { category: 'Friandises' },
  'accessoires': { category: 'Accessoires' },
  'collier': { category: 'Accessoires' },
  'laisse': { category: 'Accessoires' },
  'harnais': { category: 'Accessoires' },
  'gamelle': { category: 'Accessoires' },
  'panier': { category: 'Accessoires' },
  'shampoing': { category: 'Hygiènes & soins' },
  'shampooing': { category: 'Hygiènes & soins' },
  'toilettage': { category: 'Hygiènes & soins' },
  'soins': { category: 'Hygiènes & soins' },
  'hygiène': { category: 'Hygiènes & soins' },
  'jouets': { category: 'Jouets' },
  'jouet': { category: 'Jouets' },
  'balle': { category: 'Jouets' },
  'peluche': { category: 'Jouets' },
  'plumeau': { category: 'Jouets' },
  'laser': { category: 'Jouets' }
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const animal = params['animal'] || null;
      const category = params['category'] || null;
      const search = params['search'] || null;
      this.fetchProducts(animal, category, search);
    });
  }

  fetchProducts(animal?: string, category?: string, search?: string): void {
    this.apiService.getProducts().subscribe({
      next: (data) => {
        let allProducts = (data.products || []).map((product: any) => {
          const imageUrl = product.imageUrl?.trim() !== '' ? product.imageUrl : 'assets/default-product.jpg';
          return {
            ...product,
            imageUrl,
            title: product.title?.trim() || 'Produit sans titre',
            category: product.category?.trim() || 'Catégorie inconnue',
            animal: product.animal?.trim() || null,
            brand: product.brand?.trim() || 'Marque inconnue',
            price: product.price ?? 'Prix non disponible'
          };
        });

        // ✅ Filtre animal
        if (animal) {
          allProducts = allProducts.filter(
            (p: any) => p.animal?.toLowerCase() === animal.toLowerCase()
          );
        }

        // ✅ Filtre catégorie
        if (category) {
          allProducts = allProducts.filter(
            (p: any) => p.category?.toLowerCase() === category.toLowerCase()
          );
        }

        // ✅ Filtre recherche avec synonymes
        if (search) {
          const lowerSearch = search.toLowerCase();

          let mapped: { category: string; animal?: string } | undefined;

          for (const key of Object.keys(this.categorySynonyms)) {
            if (lowerSearch.includes(key)) {
              mapped = this.categorySynonyms[key];
              break;
            }
          }

          if (mapped) {
            allProducts = allProducts.filter((p: any) => {
              const matchCategory = p.category?.toLowerCase() === mapped!.category.toLowerCase();
              const matchAnimal = mapped!.animal ? p.animal?.toLowerCase() === mapped!.animal.toLowerCase() : true;
              return matchCategory && matchAnimal;
            });
          } else {
            // 🔹 Recherche classique (titre, marque, catégorie)
            allProducts = allProducts.filter(
              (p: any) =>
                p.title.toLowerCase().includes(lowerSearch) ||
                p.brand.toLowerCase().includes(lowerSearch) ||
                p.category.toLowerCase().includes(lowerSearch)
            );
          }
        }

        this.products = allProducts;
        this.filteredProducts = [...allProducts];

        // 🔹 Récupération des marques disponibles
        this.brands = Array.from(
          new Set(allProducts.map((p: any) => String(p.brand)).filter(Boolean))
        ) as string[];

        console.log('Produits affichés après filtre :', this.filteredProducts);
        console.log('Marques disponibles :', this.brands);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la récupération des produits.';
        console.error('Erreur API :', err);
      }
    });
  }

  getMinPrice(product: any): number | null {
    if (!product.variations || product.variations.length === 0) return null;
    const prices = product.variations
      .map((v: any) => v.price)
      .filter((p: any) => p !== null && p !== undefined);
    return prices.length > 0 ? Math.min(...prices) : null;
  }

  // 🔹 Filtres par marque
  toggleBrandFilter(brand: string): void {
    if (this.selectedBrands.includes(brand)) {
      this.selectedBrands = this.selectedBrands.filter((b) => b !== brand);
    } else {
      this.selectedBrands.push(brand);
    }
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.products];
    if (this.selectedBrands.length > 0) {
      filtered = filtered.filter((p) => this.selectedBrands.includes(p.brand));
    }
    this.filteredProducts = filtered;
  }

  trackByProductId(index: number, product: any): string {
    return product._id || index.toString();
  }

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

  goToProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }
}
