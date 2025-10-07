import { Injectable, computed, signal, inject } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private storage = inject(StorageService);

  // Signal para verificar si hay token
  private tokenSignal = signal<string | null>(null);
  private expirationSignal = signal<number | null>(null);

  // Computed signal que determina si está autenticado basado en el token
  isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    if (!token || token === 'null') return false;

    // Verificar también que no haya expirado
    const expiration = this.expirationSignal();
    if (!expiration) return false;

    const now = Date.now();

    return now < expiration;
  });

  constructor() {
    // Inicializar el token signal
    this.updateTokenSignal();
  }

  async updateTokenSignal() {
    const token = await this.storage.get('token');
    const expiration = await this.storage.get('token-expiration');
    this.tokenSignal.set(token);
    this.expirationSignal.set(expiration ? parseInt(expiration) : null);
  }

  async clearAuth() {
    await this.storage.remove('token');
    await this.storage.remove('token-expiration');
    await this.storage.remove('identity');
    await this.storage.remove('client');
    await this.updateTokenSignal();
  }
}
