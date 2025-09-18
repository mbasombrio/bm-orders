import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user';

// Interfaces para compatibilidad con tu sistema



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public readonly TOKEN_KEY = 'token';
  private readonly IDENTITY_KEY = 'identity';
  public user: User | null = null;
  http = inject(HttpClient);

  // URL del backend usando environment
  private readonly API_URL = environment.url;

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }


  private isTokenValid(token: string | null): boolean {
    if (!token || token === 'null') return false;

    try {
      // Verificar expiración del token
      const expiration = localStorage.getItem('token-expiration');
      if (expiration) {
        const expirationTime = JSON.parse(expiration);
        if (Date.now() > expirationTime) {
          this.removeToken();
          return false;
        }
      }
      return token.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Método de login compatible con tu sistema
  login(username: string, password: string, client?: string): Observable<any> {
    const user = new User();
    user.userName = username;
    user.password = password;

    // Usar cliente proporcionado o el default del environment
    const clientToUse = client || environment.nameMultiClient;
    user.client = clientToUse.toLowerCase();
    localStorage.setItem('client', user.client);

    // Descomenta esta línea cuando tengas el backend real:
    return this.http.post<any>(`${this.API_URL}loginService`, user, {
      observe: 'response',
      responseType: 'text' as 'json'
    });
  }


  logout(): void {
    this.removeToken();
    localStorage.removeItem(this.IDENTITY_KEY);
    localStorage.removeItem('client');
    localStorage.removeItem('menuPreferences');
    sessionStorage.removeItem('previousUser');
    this.user = null;
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token && token !== 'null' ? token : null;
  }

  getIdentity(): User | null {
    const identity = localStorage.getItem(this.IDENTITY_KEY);
    if (identity && identity !== 'null') {
      try {
        return JSON.parse(identity);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.user || this.getIdentity();
  }

  saveToken(token: string, tokenExpiration: string): void {
    console.log('saveToken llamado con token:', !!token, 'expiration:', tokenExpiration);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem('token-expiration', tokenExpiration);

  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('token-expiration');
  }

  // Método para verificar permisos (compatible con tu sistema)
  showMenu(key: string): boolean {
    const login = localStorage.getItem(this.IDENTITY_KEY);
    if (!login) {
      return false;
    }

    try {
      // Verificar menuPreferences en localStorage
      const menuPreferences = localStorage.getItem("menuPreferences");
      if (menuPreferences) {
        const preferences = JSON.parse(menuPreferences);
        const preference = preferences.find((item: any) => item.key === "menu" && item.value === key);

        if (preference && preference.value2 === "false") {
          return false;
        }
      }

      // Verificar restricciones del usuario
      const user = JSON.parse(login);
      if (user && user.hasOwnProperty("restrictions") && user.restrictions) {
        if (!user.restrictions[key]) {
          return true;
        }
        return user.restrictions[key]["read"] === true;
      }

      return true;
    } catch (error) {
      console.error('Error parsing user identity or menu preferences:', error);
      return false;
    }
  }

  isBasicUser(): boolean {
    const identity = this.getIdentity();
    return identity?.role === 2;
  }
}
