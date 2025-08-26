// src/app/services/cart.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface CartItem {
  id: number;
  product_id: number;
  variant_id: number;
  product_title: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}
export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
}

export interface AddItemPayload {
  product_id: number;
  variant_id: number;
  quantity: number;
  unit_price: number;
  product_title?: string;
  image_url?: string;
}
export interface AddItemResponse {
  id: number;
  total_price: number;
}
export interface UpdateQtyResponse {
  id: number;
  total_price: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private base = '/api'; // proxy → http://127.0.0.1:8000/api

  // ✅ Signal pour le compteur du panier
  cartCount = signal<number>(0);

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.base}/cart/`, { withCredentials: true }).pipe(
      tap(cart => {
        const total = cart.items.reduce((acc, it) => acc + it.quantity, 0);
        this.cartCount.set(total);
      })
    );
  }

  addItem(payload: AddItemPayload): Observable<AddItemResponse> {
    return this.http.post<AddItemResponse>(`${this.base}/cart/items/`, payload, { withCredentials: true }).pipe(
      tap(() => {
        // 🔄 Après ajout, on recharge le panier pour mettre à jour le compteur
        this.getCart().subscribe();
      })
    );
  }

  updateQty(itemId: number, quantity: number): Observable<UpdateQtyResponse> {
    return this.http.patch<UpdateQtyResponse>(`${this.base}/cart/items/${itemId}/`, { quantity }, { withCredentials: true }).pipe(
      tap(() => this.getCart().subscribe())
    );
  }

  removeItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/cart/items/${itemId}/`, { withCredentials: true }).pipe(
      tap(() => this.getCart().subscribe())
    );
  }
}
