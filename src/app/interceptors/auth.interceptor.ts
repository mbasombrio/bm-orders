import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(StorageService);

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
        })
      );
    })
  );
};
