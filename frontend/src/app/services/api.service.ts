import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl: string = 'http://127.0.0.1:8000'; // Vérifie que c'est bien l'URL correcte

  constructor(private http: HttpClient) {}

  // Headers avec clé d'API
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Token 5802752220959a88937f4c87266bc1815b26eaef',
      'Content-Type': 'application/json'
    });
  }

  // Méthode GET avec headers
  getData(endpoint: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/${endpoint}`, { headers });
  }

  // Méthode POST avec headers
  postData(endpoint: string, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/${endpoint}`, data, { headers });
  }

  // Méthode PUT avec headers
  putData(endpoint: string, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/${endpoint}`, data, { headers });
  }

  // Méthode DELETE avec headers
  deleteData(endpoint: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/${endpoint}`, { headers });
  }
}
