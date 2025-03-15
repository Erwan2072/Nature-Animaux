import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000'; // ✅ Mise à jour de l'URL de base

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ✅ Récupération asynchrone des headers avec le token
  private getHeaders(): Observable<HttpHeaders> {
    return this.authService.getToken().pipe(
      map(token => {
        let headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        });

        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
          console.log("🔑 Token envoyé dans les headers :", token);
        } else {
          console.warn("⚠️ Aucun token d'authentification disponible !");
        }

        return headers;
      })
    );
  }

  // ✅ Gestion centralisée des erreurs API
  private handleError(error: any): Observable<never> {
    console.error("❌ Erreur API :", error);
    if (error.status === 401) {
      console.warn("🔴 Token expiré ou invalide, déconnexion en cours...");
      this.authService.logout();
      // TODO : Rediriger vers la page de connexion si nécessaire
    }
    return throwError(() => new Error(error.message || "Erreur API"));
  }

  // ✅ Récupérer les produits avec pagination
  getProducts(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}/products/`; // 🔥 Utilise uniquement /products/ pour le lazy loading
    const params = new HttpParams().set('page', page.toString());

    return this.getHeaders().pipe(
      switchMap(headers => this.http.get(url, { headers, params })),
      map((response: any) => ({
        products: response.results || [],
        next: response.next || null,
        previous: response.previous || null
      })),
      catchError(this.handleError)
    );
  }

  // ✅ Récupérer un produit par ID
  getProductById(id: string): Observable<any> {
    const url = `${this.baseUrl}/products/product-detail/${id}/`;
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get(url, { headers })),
      catchError(this.handleError)
    );
  }

  // ✅ Ajouter un produit
  addProduct(product: any): Observable<any> {
    const url = `${this.baseUrl}/products/product-create/`;
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post(url, product, { headers })),
      catchError(this.handleError)
    );
  }

  // ✅ Modifier un produit
  updateProduct(id: string, product: any): Observable<any> {
    const url = `${this.baseUrl}/products/product-update/${id}/`;
    return this.getHeaders().pipe(
      switchMap(headers => this.http.patch(url, product, { headers })),
      catchError(this.handleError)
    );
  }

  // ✅ Supprimer un produit
  deleteProduct(id: string): Observable<any> {
    const url = `${this.baseUrl}/products/product-delete/${id}/`;
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(url, { headers })),
      catchError(this.handleError)
    );
  }
}
