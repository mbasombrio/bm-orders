import { TestBed } from '@angular/core/testing';
import { AuthStateService } from './auth-state.service';
import { StorageService } from './storage.service';

describe('AuthStateService', () => {
  let service: AuthStateService;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('StorageService', ['get', 'remove']);
    storageSpy.get.and.resolveTo(null);

    TestBed.configureTestingModule({
      providers: [
        AuthStateService,
        { provide: StorageService, useValue: storageSpy },
      ]
    });
    service = TestBed.inject(AuthStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAuthenticated', () => {
    it('should be false when no token', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should be true after updating with valid token and future expiration', async () => {
      storageSpy.get.and.callFake(async (key: string) => {
        if (key === 'token') return 'valid-token';
        if (key === 'token-expiration') return String(Date.now() + 60000);
        return null;
      });

      await service.updateTokenSignal();

      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should be false when token is "null" string', async () => {
      storageSpy.get.and.callFake(async (key: string) => {
        if (key === 'token') return 'null';
        if (key === 'token-expiration') return String(Date.now() + 60000);
        return null;
      });

      await service.updateTokenSignal();

      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should be false when token is expired', async () => {
      storageSpy.get.and.callFake(async (key: string) => {
        if (key === 'token') return 'valid-token';
        if (key === 'token-expiration') return String(Date.now() - 60000);
        return null;
      });

      await service.updateTokenSignal();

      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should be false when no expiration', async () => {
      storageSpy.get.and.callFake(async (key: string) => {
        if (key === 'token') return 'valid-token';
        if (key === 'token-expiration') return null;
        return null;
      });

      await service.updateTokenSignal();

      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('clearAuth', () => {
    it('should remove all auth keys from storage', async () => {
      storageSpy.remove.and.resolveTo();
      storageSpy.get.and.resolveTo(null);

      await service.clearAuth();

      expect(storageSpy.remove).toHaveBeenCalledWith('token');
      expect(storageSpy.remove).toHaveBeenCalledWith('token-expiration');
      expect(storageSpy.remove).toHaveBeenCalledWith('identity');
      expect(storageSpy.remove).toHaveBeenCalledWith('client');
    });

    it('should set isAuthenticated to false after clearing', async () => {
      storageSpy.remove.and.resolveTo();
      storageSpy.get.and.resolveTo(null);

      await service.clearAuth();

      expect(service.isAuthenticated()).toBeFalse();
    });
  });
});
