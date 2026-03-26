import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  return from(
    Promise.all([
      storage.get('token'),
      storage.get('client')
    ])
  ).pipe(
    switchMap(([token, client]) => {
      const validToken = token && token !== 'null' ? token : null;

      // Clonar el request con los headers necesarios
      let modifiedRequest = request.clone({
        setHeaders: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'client': client || ''
        }
      });

      // Agregar token si existe
      if (validToken) {
        modifiedRequest = modifiedRequest.clone({
          setHeaders: {
            'jwt-token': validToken
          }
        });
      }

      return next(modifiedRequest).pipe(
        map((event) => {
          if (event instanceof HttpResponse) {
            if (event.status === 200) {
              const tokenFromResponse = event.headers.get('jwt-token');
              const tokenExpiration = event.headers.get('token-expiration');

              if (tokenFromResponse && tokenExpiration) {
                const timeExpiration: number =
                  Number(tokenExpiration) + Number(new Date().getTime());
                storage.set('token', tokenFromResponse);
                storage.set('token-expiration', JSON.stringify(timeExpiration));
              }
            }
          }
          return event;
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            authService.logout().then(() => {
              authStateService.clearAuth();
              router.navigate(['/login']);
            });
          }
          return throwError(() => error);
        })
      );
    })
  );
};
