import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

/**
 * Route guard that checks if the authenticated user has a specific permission.
 */
export const permissionGuard = (requiredPermission: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const checkPermission = () => {
      if (authService.hasPermission(requiredPermission)) {
        return true;
      }
      // If unauthorized, redirect to main dashboard
      router.navigate(['/dashboard']);
      return false;
    };

    // Wait for the auth profile to load if it hasn't already
    if (!authService.isLoaded()) {
      return toObservable(authService.isLoaded).pipe(
        filter((loaded) => loaded),
        take(1),
        map(() => checkPermission())
      );
    }

    return checkPermission();
  };
};
