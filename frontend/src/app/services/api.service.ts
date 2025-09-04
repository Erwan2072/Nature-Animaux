import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000'; // URL de base Django

  constructor(private http: HttpClient, private authService: AuthService) {}

  // 🔑 Générer les headers avec le token JWT
  private getHeaders(isFormData: boolean = false): Observable<HttpHeaders> {
    return this.authService.getToken().pipe(
      map(token => {
        let headers = new HttpHeaders({
          'Accept': 'application/json'
        });

        // ⚠️ Ne pas fixer Content-Type si FormData
        if (!isFormData) {
          headers = headers.set('Content-Type', 'application/json');
        }

        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
          console.log("🔑 Token envoyé :", token);
        } else {
          console.warn("⚠️ Aucun token trouvé.");
        }

        return headers;
      })
    );
  }

  // Gestion centralisée des erreurs
  private handleError(error: any): Observable<never> {
    console.error("❌ Erreur API :", error);
    if (error.status === 401) {
      console.warn("🔴 Token expiré, déconnexion...");
      this.authService.logout();
    }
    return throwError(() => new Error(error.message || "Erreur API"));
  }

  // Obtenir tous les produits avec pagination + filtres animal/category
getProducts(page: number = 1, animal?: string, category?: string): Observable<any> {
  const url = `${this.baseUrl}/products/`;

  let params = new HttpParams().set('page', page.toString());

  if (animal) {
    params = params.set('animal', animal.toLowerCase()); // ⚠ toujours en minuscule
  }
  if (category) {
    params = params.set('category', category);
  }

  return this.getHeaders().pipe(
    switchMap(headers => this.http.get(url, { headers, params })),
    map((response: any) => {
      console.log("Produits reçus :", response.results);
      return {
        products: response.results || [],
        next: response.next || null,
        previous: response.previous || null
      };
    }),
    catchError(this.handleError)
  );
}


  // Récupérer un produit spécifique
  getProductById(id: string): Observable<any> {
    const url = `${this.baseUrl}/products/product-detail/${id}/`;
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get(url, { headers })),
      catchError(this.handleError)
    );
  }

  // ➕ Créer un produit
  addProduct(product: any): Observable<any> {
    const url = `${this.baseUrl}/products/product-create/`;
    const isFormData = product instanceof FormData;

    return this.getHeaders(isFormData).pipe(
      switchMap(headers => {
        if (isFormData) headers = headers.delete('Content-Type');
        return this.http.post(url, product, { headers });
      }),
      catchError(this.handleError)
    );
  }

  // Modifier un produit existant
  updateProduct(id: string, product: any): Observable<any> {
    const url = `${this.baseUrl}/products/product-update/${id}/`;
    const isFormData = product instanceof FormData;

    return this.getHeaders(isFormData).pipe(
      switchMap(headers => {
        if (isFormData) headers = headers.delete('Content-Type');
        console.log("📤 Données envoyées updateProduct :", product);
        return this.http.put(url, product, { headers });
      }),
      catchError(this.handleError)
    );
  }

  // Supprimer un produit
  deleteProduct(id: string): Observable<any> {
    const url = `${this.baseUrl}/products/product-delete/${id}/`;
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(url, { headers })),
      catchError(this.handleError)
    );
  }
}