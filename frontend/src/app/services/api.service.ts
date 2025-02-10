import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000/products'; // ✅ Correction de l'URL
  private authToken = '5802752220959a88937f4c87266bc1815b26eaef'; // ✅ Vérifie que ce token est toujours valide

  constructor(private http: HttpClient) {}

  // ✅ Générer les headers avec Token + Content-Type
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Token ${this.authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // ✅ Récupérer tous les produits depuis `/products/product-list/`
  getProducts(): Observable<any> {
    console.log("📡 Envoi de la requête GET vers l'API :", `${this.baseUrl}/product-list/`);
    return this.http.get(`${this.baseUrl}/product-list/`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors de la récupération des produits :", error);
        return throwError(() => new Error("Erreur lors de la récupération des produits"));
      })
    );
  }

  // ✅ Récupérer un produit par ID
  getProductById(id: string): Observable<any> {
    console.log(`📡 Envoi de la requête GET pour récupérer le produit ID: ${id}`);
    return this.http.get(`${this.baseUrl}/product-detail/${id}/`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error(`❌ Erreur lors de la récupération du produit ${id} :`, error);
        return throwError(() => new Error(`Erreur lors de la récupération du produit ${id}`));
      })
    );
  }

  // ✅ Ajouter un nouveau produit
  addProduct(product: any): Observable<any> {
    console.log("📡 Envoi de la requête POST pour ajouter un produit :", product);
    return this.http.post(`${this.baseUrl}/product-create/`, product, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors de l'ajout du produit :", error);
        return throwError(() => new Error("Erreur lors de l'ajout du produit"));
      })
    );
  }

  // ✅ Modifier un produit existant
  updateProduct(id: string, product: any): Observable<any> {
    console.log(`📡 Envoi de la requête PUT pour modifier le produit ID: ${id}`, product);
    return this.http.put(`${this.baseUrl}/product-update/${id}/`, product, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error(`❌ Erreur lors de la mise à jour du produit ${id} :`, error);
        return throwError(() => new Error(`Erreur lors de la mise à jour du produit ${id}`));
      })
    );
  }

  // ✅ Supprimer un produit
  deleteProduct(id: string): Observable<any> {
    console.log(`📡 Envoi de la requête DELETE pour supprimer le produit ID: ${id}`);
    return this.http.delete(`${this.baseUrl}/product-delete/${id}/`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error(`❌ Erreur lors de la suppression du produit ${id} :`, error);
        return throwError(() => new Error(`Erreur lors de la suppression du produit ${id}`));
      })
    );
  }
}
