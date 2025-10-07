import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { StorageService } from './storage.service';

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
  storage = inject(StorageService);

  // URL del backend usando environment
  private readonly API_URL = environment.url;

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }


  async isTokenValid(token: string | null): Promise<boolean> {
    if (!token || token === 'null') return false;

    try {
      // Verificar expiración del token
      const expiration = await this.storage.get('token-expiration');
      if (expiration) {
        const expirationTime = JSON.parse(expiration);
        if (Date.now() > expirationTime) {
          await this.removeToken();
          return false;
        }
      }
      return token.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Método de login compatible con tu sistema
  async login(username: string, password: string, client?: string): Promise<Observable<any>> {
    const user = new User();
    user.userName = username;
    user.password = password;

    // Usar cliente proporcionado o el default del environment
    const clientToUse = client || environment.nameMultiClient;
    user.client = clientToUse.toLowerCase();
    await this.storage.set('client', user.client);

    // Descomenta esta línea cuando tengas el backend real:
    return this.http.post<any>(`${this.API_URL}loginService`, user, {
      observe: 'response',
      responseType: 'text' as 'json'
    });
  }


  async logout(): Promise<void> {
    await this.removeToken();
    await this.storage.remove(this.IDENTITY_KEY);
    await this.storage.remove('client');
    await this.storage.remove('menuPreferences');
    await this.storage.remove('previousUser');
    this.user = null;
    this.isAuthenticatedSubject.next(false);
  }

  async getToken(): Promise<string | null> {
    const token = await this.storage.get(this.TOKEN_KEY);
    return token && token !== 'null' ? token : null;
  }

  async getIdentity(): Promise<User | null> {
    const identity = await this.storage.get(this.IDENTITY_KEY);
    if (identity && identity !== 'null') {
      try {
        return typeof identity === 'string' ? JSON.parse(identity) : identity;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.user || await this.getIdentity();
  }

  async saveToken(token: string, tokenExpiration: string): Promise<void> {
    console.log('saveToken llamado con token:', !!token, 'expiration:', tokenExpiration);
    await this.storage.set(this.TOKEN_KEY, token);
    await this.storage.set('token-expiration', tokenExpiration);
  }

  async removeToken(): Promise<void> {
    await this.storage.remove(this.TOKEN_KEY);
    await this.storage.remove('token-expiration');
  }

  // Método para verificar permisos (compatible con tu sistema)
  async showMenu(key: string): Promise<boolean> {
    const login = await this.storage.get(this.IDENTITY_KEY);
    if (!login) {
      return false;
    }

    try {
      // Verificar menuPreferences
      const menuPreferences = await this.storage.get("menuPreferences");
      if (menuPreferences) {
        const preferences = typeof menuPreferences === 'string' ? JSON.parse(menuPreferences) : menuPreferences;
        const preference = preferences.find((item: any) => item.key === "menu" && item.value === key);

        if (preference && preference.value2 === "false") {
          return false;
        }
      }

      // Verificar restricciones del usuario
      const user = typeof login === 'string' ? JSON.parse(login) : login;
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

  async isBasicUser(): Promise<boolean> {
    const identity = await this.getIdentity();
    return identity?.role === 2;
  }
}
