import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { CartService, CartItem } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  private titleSvc = inject(Title);
  private meta = inject(Meta);

  items = signal<CartItem[]>([]);
  subtotal = signal<number>(0);
  loaded = signal(false);

  // qty optimiste local (pour retour instantané)
  private localQty = new Map<number, number>();

  constructor(private cart: CartService) {}

  ngOnInit() {
    // SEO: titre + meta description par page
    this.titleSvc.setTitle('Panier — Nature & Animaux');
    this.meta.updateTag({
      name: 'description',
      content:
        'Consultez votre panier Nature & Animaux : quantités, prix, sous-total et passage à la commande.',
    });
    this.refresh();
  }

  trackById = (_: number, it: CartItem) => it.id;

  refresh() {
    this.cart.getCart().subscribe({
      next: (c: any) => {
        const items = c?.items ?? [];
        this.items.set(items);
        this.subtotal.set(Number(c?.subtotal ?? 0));
        this.loaded.set(true);
        this.localQty.clear();
        for (const it of items) this.localQty.set(it.id, it.quantity);
      },
      error: () => this.loaded.set(true),
    });
  }

  optimisticQty(it: CartItem) {
    return this.localQty.get(it.id) ?? it.quantity;
  }

  incr(it: CartItem) {
    const q = this.optimisticQty(it) + 1;
    this.localQty.set(it.id, q);
    this.cart.updateQty(it.id, q).subscribe(() => this.refresh());
  }

  decr(it: CartItem) {
    const q = Math.max(1, this.optimisticQty(it) - 1);
    this.localQty.set(it.id, q);
    this.cart.updateQty(it.id, q).subscribe(() => this.refresh());
  }

  remove(it: CartItem) {
    this.cart.removeItem(it.id).subscribe(() => this.refresh());
  }

  lineTotal(it: CartItem) {
    const q = this.optimisticQty(it);
    return Number(it.unit_price) * q;
  }
}
