import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000/users'; // ✅ j’ai corrigé pour correspondre à ton backend
  private authTokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<any>(null);

  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Récupération du token en sessionStorage au rechargement
    const savedToken = sessionStorage.getItem('access_token');
    if (savedToken) {
      this.authTokenSubject.next(savedToken);
      this.fetchAndStoreUserInfo();
    }
  }

  // Définit et stocke le token
  private setAuthToken(token: string | null): void {
    this.authTokenSubject.next(token);
    if (token) {
      sessionStorage.setItem('access_token', token);
    } else {
      sessionStorage.removeItem('access_token');
    }
  }

  // Récupère le token immédiatement (utile pour les headers synchrones)
  getTokenSync(): string | null {
    return this.authTokenSubject.value;
  }

  // Récupère le token en tant qu'Observable
  getToken(): Observable<string | null> {
    return this.authTokenSubject.asObservable();
  }

  // Connexion
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

  // Inscription
  register(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register/`, { email, password }).pipe(
      map(response => {
        console.log('✅ Utilisateur créé avec succès:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur d’inscription :', error);
        return throwError(() => new Error("L'inscription a échoué."));
      })
    );
  }

  // Connexion Google
  loginWithGoogle(token: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/google/`, { token }).pipe(
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

  // Récupération du profil
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
          console.log("✅ Utilisateur récupéré :", user);
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

  // Vérifie si connecté
  isAuthenticated(): Observable<boolean> {
    return this.authTokenSubject.asObservable().pipe(map(token => !!token));
  }

  // Vérifie si Admin
  isAdmin(): Observable<boolean> {
    return this.user$.pipe(map(user => user?.is_admin || false));
  }

  // Récupère rôle
  getUserRole(): Observable<string> {
    return this.user$.pipe(map(user => (user ? (user.is_admin ? 'admin' : 'user') : 'guest')));
  }

  // Déconnexion
  logout(): void {
    this.setAuthToken(null);
    this.userSubject.next(null);
  }

  // Email change methods
 
  requestEmailChange(newEmail: string): Observable<any> {
    const token = this.getTokenSync();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/change-email/`, { new_email: newEmail }, { headers });
  }

  confirmEmailChange(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/confirm-email/${token}/`);
  }
}
