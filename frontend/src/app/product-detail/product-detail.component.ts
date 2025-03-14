import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: any;
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.apiService.getProductById(productId).subscribe({
        next: (data) => {
          this.product = data;
        },
        error: (err) => {
          this.errorMessage = "Erreur lors de la récupération du produit.";
          console.error("❌ Erreur API :", err);
        }
      });
    }
  }
}
