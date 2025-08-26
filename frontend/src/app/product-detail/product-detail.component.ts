import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service'; // 👈 import du panier
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Pour ngModel

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  errorMessage: string = '';
  selectedVariationId: string = ''; // ID de la variation sélectionnée (poids)
  quantity: number = 1; // Quantité sélectionnée
  isAdding = false;
  toast: { type: 'success' | 'error', msg: string } | null = null;

  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private cartService = inject(CartService); // 👈 injection du panier

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.apiService.getProductById(productId).subscribe({
        next: (data) => {
          this.product = data;

          // Par défaut, sélectionner la première variation si disponible
          if (this.product?.variations?.length > 0) {
            this.selectedVariationId = this.product.variations[0].id;
          }

          console.log("Produit chargé :", this.product);
        },
        error: (err) => {
          this.errorMessage = "Erreur lors du chargement du produit.";
          console.error("Erreur API :", err);
        }
      });
    }
  }

  /** ✅ Renvoie le prix de la variation sélectionnée */
  getSelectedPrice(): number | null {
    const selectedVariation = this.getSelectedVariation();
    return selectedVariation?.price ?? null;
  }

  /** Récupère la variation sélectionnée */
  getSelectedVariation(): any {
    return this.product?.variations?.find((v: any) => v.id === this.selectedVariationId);
  }

  /** Ajoute au panier */
  addToCart(): void {
    const selectedVariation = this.getSelectedVariation();
    if (!selectedVariation) {
      console.warn("❗ Aucune variation sélectionnée.");
      return;
    }

    const payload = {
      product_id: this.product.id,  //garder en string (Mongo ObjectId)
      variant_id: selectedVariation.id, // idem, laisse string si c’est un sku
      quantity: this.quantity,
      unit_price: selectedVariation.price,
      product_title: `${this.product.title} - ${selectedVariation.label ?? ''}`,
      image_url: this.product.imageUrl || ''
    };


    this.isAdding = true;
    this.cartService.addItem(payload).subscribe({
      next: () => {
        this.isAdding = false;
        this.toast = { type: 'success', msg: 'Produit ajouté au panier ✅' };
        setTimeout(() => this.toast = null, 2000);
      },
      error: (err) => {
        this.isAdding = false;
        console.error('Erreur ajout panier', err);
        this.toast = { type: 'error', msg: 'Erreur lors de l’ajout au panier ❌' };
      }
    });
  }

  /** Mise en forme de la description */
  formatDescription(desc: string): string {
    if (!desc) return 'Pas de description détaillée.';

    // Mise en gras des titres
    desc = desc.replace(/Composition\s*:/gi, '<strong>Composition :</strong>');
    desc = desc.replace(/Composants Analytiques\s*:/gi, '<strong>Composants Analytiques :</strong>');
    desc = desc.replace(/Additifs\s*:/gi, '<strong>Additifs :</strong>');

    // Retours à la ligne après les sections
    desc = desc.replace(/([\.|\*])\s*/g, '$1<br><br>');

    return desc;
  }
}
