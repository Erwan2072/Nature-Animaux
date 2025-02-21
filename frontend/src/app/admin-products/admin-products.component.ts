import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service'; // Service pour gérer les produits
import { AuthService } from '../services/auth.service'; // Service pour vérifier si l'admin est connecté

interface Product {
  id?: number;
  name: string;
  price: number;
  description: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule] // ✅ Ajout de FormsModule
})
export class AdminProductsComponent implements OnInit {
  productForm: FormGroup;
  products: Product[] = [];
  errorMessage: string | null = null;
  isAdmin: boolean = false;
  activeTab: string = 'add'; // ✅ Onglet actif par défaut
  selectedProduct: Product | null = null; // ✅ Produit sélectionné pour suppression

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkAdminStatus();
  }

  // ✅ Vérifie si l'utilisateur est admin
  checkAdminStatus(): void {
    this.authService.isAdmin().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (!this.isAdmin) {
          this.router.navigate(['/login']); // 🔄 Redirection si l'utilisateur n'est pas admin
        } else {
          this.loadProducts();
        }
      },
      error: () => {
        this.errorMessage = "Erreur de vérification du statut administrateur.";
        this.router.navigate(['/login']);
      }
    });
  }

  // ✅ Définit l'onglet actif
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // ✅ Charger la liste des produits
  loadProducts(): void {
    this.adminService.getProducts().subscribe({
      next: (data: Product[]) => (this.products = data),
      error: () => (this.errorMessage = "Impossible de charger les produits.")
    });
  }

  // ✅ Ajouter un produit
  saveProduct(): void {
    if (this.productForm.invalid) return;

    this.adminService.addProduct(this.productForm.value).subscribe({
      next: () => {
        this.loadProducts();
        this.productForm.reset();
      },
      error: () => (this.errorMessage = "Erreur lors de l'ajout du produit.")
    });
  }

  // ✅ Modifier un produit
  editProduct(product: Product): void {
    this.productForm.patchValue(product);
    this.activeTab = 'edit'; // Ouvre l'onglet modification
  }

  // ✅ Sélectionner un produit pour suppression
  selectProduct(product: Product): void {
    this.selectedProduct = product;
  }

  // ✅ Supprimer un produit
  deleteProduct(): void {
    if (this.selectedProduct && this.selectedProduct.id) {
      if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
        this.adminService.deleteProduct(this.selectedProduct.id).subscribe({
          next: () => {
            this.loadProducts();
            this.selectedProduct = null; // Réinitialisation après suppression
          },
          error: () => (this.errorMessage = "Erreur lors de la suppression.")
        });
      }
    } else {
      this.errorMessage = "Veuillez sélectionner un produit avant de supprimer.";
    }
  }

  // ✅ Utilisé pour améliorer la performance de `*ngFor`
  trackByIndex(index: number, item: any): number {
    return item.id;
  }
}
