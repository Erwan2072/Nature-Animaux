import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000/api'; // 🔥 Vérifie bien que ton backend expose `/api`
  private authTokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<any>(null);

  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // ✅ Récupération du token en sessionStorage au rechargement
    const savedToken = sessionStorage.getItem('access_token');
    if (savedToken) {
      this.authTokenSubject.next(savedToken);
      this.fetchAndStoreUserInfo();
    }
  }

  // ✅ Définit et stocke le token
  private setAuthToken(token: string | null): void {
    this.authTokenSubject.next(token);
    if (token) {
      sessionStorage.setItem('access_token', token);
    } else {
      sessionStorage.removeItem('access_token');
    }
  }

  // ✅ Récupère le token immédiatement (utile pour les headers synchrones)
  getTokenSync(): string | null {
    return this.authTokenSubject.value;
  }

  // ✅ Récupère le token en tant qu'Observable (utile pour les appels asynchrones)
  getToken(): Observable<string | null> {
    return this.authTokenSubject.asObservable();
  }

  // ✅ Connexion de l'utilisateur avec email/mot de passe
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login/`, { email, password }).pipe(
      map(response => {
        if (response.access) {
          this.setAuthToken(response.access);
          this.fetchAndStoreUserInfo();
        }
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur de connexion :', error);
        return throwError(() => new Error('Échec de connexion. Vérifiez vos identifiants.'));
      })
    );
  }

  // ✅ Connexion via Google
  loginWithGoogle(token: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/google/`, { token }).pipe(
      map(response => {
        if (response.access) {
          this.setAuthToken(response.access);
          this.fetchAndStoreUserInfo();
        }
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur de connexion Google :', error);
        return throwError(() => new Error('Échec de connexion avec Google.'));
      })
    );
  }

  // ✅ Récupère et stocke les infos utilisateur après connexion
  fetchAndStoreUserInfo(): void {
    const token = this.getTokenSync();
    if (!token) {
      console.warn("⚠️ Aucun token trouvé, l'utilisateur n'est pas connecté.");
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${this.baseUrl}/profile/`, { headers }).subscribe(
      user => {
        if (user) {
          this.userSubject.next(user);
        }
      },
      error => {
        console.error('❌ Erreur lors de la récupération du profil :', error);
        if (error.status === 401) {
          console.warn('🔄 Token expiré, déconnexion automatique...');
          this.logout();
        }
      }
    );
  }

  // ✅ Vérifie si l'utilisateur est connecté
  isAuthenticated(): Observable<boolean> {
    return this.authTokenSubject.asObservable().pipe(map(token => !!token));
  }

  // ✅ Vérifie si l'utilisateur est Admin
  isAdmin(): Observable<boolean> {
    return this.user$.pipe(map(user => user?.is_admin || false));
  }

  // ✅ Récupère le rôle utilisateur
  getUserRole(): Observable<string> {
    return this.user$.pipe(map(user => (user ? (user.is_admin ? 'admin' : 'user') : 'guest')));
  }

  // ✅ Déconnexion complète
  logout(): void {
    this.setAuthToken(null);
    this.userSubject.next(null);
  }
}
