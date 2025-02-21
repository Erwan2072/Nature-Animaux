import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Ajout de CommonModule pour gérer *ngIf et *ngFor
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true, // ✅ Si ton projet Angular est en mode standalone
  imports: [CommonModule] // ✅ Ajout pour éviter les erreurs NG8103
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  errorMessage: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  // ✅ Récupère la liste des produits
  fetchProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data.products || []; // ✅ Évite une erreur si `data.products` est null
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de la récupération des produits.";
        console.error("❌ Erreur API :", err);
      }
    });
  }

  // ✅ Supprime un produit avec confirmation
  deleteProduct(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.apiService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(product => product.id !== id);
        },
        error: (err) => {
          this.errorMessage = "Erreur lors de la suppression du produit.";
          console.error("❌ Erreur de suppression :", err);
        }
      });
    }
  }

  // ✅ Optimisation *ngFor avec trackBy
  trackByProductId(index: number, product: any): string {
    return product.id; // Utilisation de l'ID pour limiter les re-rendus inutiles
  }
}
