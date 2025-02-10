import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000'; // 🔗 URL du backend Django
  private tokenKey = 'auth_token';

  private http = inject(HttpClient); // ✅ Injection propre en standalone

  // ✅ Vérifie si l'utilisateur est Admin
  isAdmin(): Observable<boolean> {
    return this.http.get<any>(`${this.baseUrl}/user-info/`, {
      headers: { 'Authorization': `Token ${localStorage.getItem(this.tokenKey)}` }
    }).pipe(
      map(user => user.is_superuser) // 🔥 Vérifie si l'utilisateur est superutilisateur
    );
  }
}
