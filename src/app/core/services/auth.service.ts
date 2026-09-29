import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserProfile } from '../../features/auth/models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly TOKEN_KEY = 'erp_access_token';
    private readonly USER_KEY = 'erp_user_profile';
    private readonly API_URL = '/api/auth';

    // State management via Angular Signals
    readonly currentUser = signal<UserProfile | null>(this.getStoredUser());
    readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.getToken());

    /**
     * User login via Nest.js backend
     */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
            tap((response) => {
                this.setSession(response);
            })
        );
    }

    /**
     * Clear session, reset signals and redirect to login
     */
    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    /**
     * Retrieve active JWT access token
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Check if user has specific permission.
     * Admin and SuperAdmin always bypass permission checks.
     */
    hasPermission(permission: string): boolean {
        const user = this.currentUser();
        if (!user) {
            return false;
        }

        if (user.isSuperAdmin || user.role?.toUpperCase() === 'SUPER_ADMIN' || user.role?.toUpperCase() === 'ADMIN') {
            return true;
        }

        return Array.isArray(user.permissions) && user.permissions.includes(permission);
    }

    /**
     * Check if user has specific role.
     * SuperAdmin bypasses role check.
     */
    hasRole(role: string): boolean {
        const user = this.currentUser();
        if (!user) {
            return false;
        }

        if (user.isSuperAdmin || user.role?.toUpperCase() === 'SUPER_ADMIN') {
            return true;
        }

        return user.role?.toUpperCase() === role.toUpperCase();
    }

    /**
     * Persist session state in localStorage and update Signal
     */
    private setSession(authResult: LoginResponse): void {
        localStorage.setItem(this.TOKEN_KEY, authResult.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
        this.currentUser.set(authResult.user);
    }

    /**
     * Restore user from localStorage on initialization
     */
    private getStoredUser(): UserProfile | null {
        const userJson = localStorage.getItem(this.USER_KEY);
        if (!userJson) {
            return null;
        }
        try {
            return JSON.parse(userJson) as UserProfile;
        } catch {
            localStorage.removeItem(this.USER_KEY);
            return null;
        }
    }
}
