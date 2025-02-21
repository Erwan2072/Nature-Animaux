import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://127.0.0.1:8000/api/products';

  constructor(private http: HttpClient) {}

  // ✅ Récupérer tous les produits
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/`);
  }

  // ✅ Ajouter un produit
  addProduct(productData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/`, productData);
  }

  // ✅ Modifier un produit
  updateProduct(productId: number, updatedData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${productId}/`, updatedData);
  }

  // ✅ Supprimer un produit
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${productId}/`);
  }
}
