import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = await authService.getToken();
  if (token) {
     router.navigate(['/home']);
    return false;
  } else {
    // Redirigir al login si no está autenticado
   return true;

  }
};
