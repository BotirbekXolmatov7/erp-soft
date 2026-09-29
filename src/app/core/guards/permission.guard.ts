import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // If not authenticated, send to login first
    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: state.url }
        });
    }

    const requiredPermission = route.data?.['permission'] as string | undefined;
    const requiredPermissions = route.data?.['permissions'] as string[] | undefined;

    // If no permission metadata is set, allow access
    if (!requiredPermission && (!requiredPermissions || requiredPermissions.length === 0)) {
        return true;
    }

    // Single permission check
    if (requiredPermission && authService.hasPermission(requiredPermission)) {
        return true;
    }

    // Multiple permissions check (user must have at least one)
    if (requiredPermissions && requiredPermissions.some((perm) => authService.hasPermission(perm))) {
        return true;
    }

    // Authenticated but forbidden: redirect to Sakai access-denied page
    return router.createUrlTree(['/auth/access']);
};
