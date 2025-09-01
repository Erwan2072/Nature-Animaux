import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartService, CartItem } from '../services/cart.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterModule]
})
export class DeliveryComponent implements OnInit {

  private cart = inject(CartService);
  private http = inject(HttpClient);

  items = signal<CartItem[]>([]);
  subtotal = signal<number>(0);
  totalWeight: number = 0;

  selectedDelivery: string | null = null;
  deliveryOptions: { mode: string, label: string, fees: number }[] = [];

  ngOnInit(): void {
    this.loadCartAndDelivery();
  }

  // --- Charger panier + options de livraison ---
  loadCartAndDelivery(): void {
    this.cart.getCart().subscribe({
      next: (c: any) => {
        const items = c?.items ?? [];
        this.items.set(items);
        this.subtotal.set(Number(c?.subtotal ?? 0));

        // calcul du poids total
        this.totalWeight = items.reduce(
          (acc: number, it: any) => acc + (Number(it.weight) * it.quantity),
          0
        );

        // une fois qu’on a le poids, on appelle l’API livraison
        this.loadDeliveryOptions(this.totalWeight);
      },
      error: (err) => console.error("❌ Erreur chargement panier :", err)
    });
  }

  // --- Charger options livraison (backend mock) ---
  loadDeliveryOptions(weight: number): void {
    this.http.get<any>(`http://127.0.0.1:8000/api/delivery/options/?weight=${weight}`)
      .subscribe({
        next: (data) => {
          console.log("✅ Options livraison :", data);
          this.deliveryOptions = data.options ?? [];
        },
        error: (err) => console.error("❌ Erreur options livraison :", err)
      });
  }

  getSelectedFees(): number {
    const opt = this.deliveryOptions.find(o => o.mode === this.selectedDelivery);
    return opt ? Number(opt.fees) : 0;
  }

  getTotal(): number {
    return this.subtotal() + this.getSelectedFees();
  }

  confirmDelivery(): void {
    if (!this.selectedDelivery) {
      alert("❌ Veuillez sélectionner un mode de livraison !");
      return;
    }

    const chosen = this.deliveryOptions.find(o => o.mode === this.selectedDelivery);

    alert(
      `🚚 Livraison choisie : ${chosen?.label}\n\n` +
      `Sous-total : ${this.subtotal().toFixed(2)} €\n` +
      `Poids total : ${this.totalWeight} kg\n` +
      `Frais de livraison : ${chosen?.fees.toFixed(2)} €\n\n` +
      `💰 Total à payer : ${this.getTotal().toFixed(2)} €`
    );
  }
}
