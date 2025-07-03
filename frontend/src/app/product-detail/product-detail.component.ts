import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
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

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

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

  getMinPrice(): number | null {
    if (!this.product?.variations || this.product.variations.length === 0) {
      return null;
    }

    const prices = this.product.variations
      .map((v: any) => v.price)
      .filter((p: number) => p !== null && p !== undefined);

    return prices.length > 0 ? Math.min(...prices) : null;
  }

  addToCart(): void {
    const selectedVariation = this.product?.variations?.find((v: any) => v.id === this.selectedVariationId);
    if (selectedVariation) {
      console.log(` Ajouté au panier :`, {
        productId: this.product.id,
        title: this.product.title,
        variation: selectedVariation,
        quantity: this.quantity
      });
      // Intégration panier future ici
    } else {
      console.warn("❗ Aucune variation sélectionnée.");
    }
  }

  getSelectedVariation(): any {
    return this.product?.variations?.find((v: any) => v.id === this.selectedVariationId);
  }


  formatDescription(desc: string): string {
    if (!desc) return 'Pas de description détaillée.';

    //  Mise en gras des titres
    desc = desc.replace(/Composition\s*:/gi, '<strong>Composition :</strong>');
    desc = desc.replace(/Composants Analytiques\s*:/gi, '<strong>Composants Analytiques :</strong>');
    desc = desc.replace(/Additifs\s*:/gi, '<strong>Additifs :</strong>');

    // Retours à la ligne après les sections
    desc = desc.replace(/([\.|\*])\s*/g, '$1<br><br>');

    return desc;
  }

}
