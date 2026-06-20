import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If AuthService hasn't loaded user profile yet, wait for it
  if (!authService.isLoaded()) {
    return toObservable(authService.isLoaded).pipe(
      filter((loaded) => loaded),
      take(1),
      map(() => {
        if (!authService.isAuthenticated()) {
          return true;
        }
        router.navigate(['/dashboard']);
        return false;
      })
    );
  }

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
