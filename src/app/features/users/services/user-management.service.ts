import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map, tap } from 'rxjs';
import { CompanyUser, CreateCompanyUserDto, RoleOption, UsersResponse } from '../models/user-management.model';

@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/users';

    // Reactive State Management using Angular Signals
    private readonly _users = signal<CompanyUser[]>([]);
    private readonly _roles = signal<RoleOption[]>([]);
    private readonly _isLoading = signal<boolean>(false);

    readonly users = this._users.asReadonly();
    readonly roles = this._roles.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();

    // Computed metrics for cards
    readonly totalUsersCount = computed(() => this._users().length);
    readonly activeUsersCount = computed(
        () => this._users().filter((u) => u.isActive).length
    );
    readonly inactiveUsersCount = computed(
        () => this._users().filter((u) => !u.isActive).length
    );

    /**
     * Kompaniya xodimlari ro'yxatini yuklash
     */
    loadUsers(): Observable<CompanyUser[]> {
        this._isLoading.set(true);
        return this.http.get<UsersResponse | CompanyUser[]>(this.apiUrl).pipe(
            map((res) => {
                if (Array.isArray(res)) {
                    return res;
                }
                return res?.data ?? [];
            }),
            tap((data) => {
                this._users.set(data);
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }

    /**
     * Kompaniyaga biriktirish mumkin bo'lgan rollarni yuklash
     */
    loadRoles(): Observable<RoleOption[]> {
        return this.http.get<RoleOption[]>(`${this.apiUrl}/roles`).pipe(
            tap((data) => {
                this._roles.set(data);
            })
        );
    }

    /**
     * Yangi xodim qo'shish
     */
    createUser(dto: CreateCompanyUserDto): Observable<CompanyUser> {
        this._isLoading.set(true);
        return this.http.post<CompanyUser>(this.apiUrl, dto).pipe(
            tap(() => {
                this.loadUsers().subscribe();
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }

    /**
     * Xodimning faollik holatini (Active / Blocked) o'zgartirish
     */
    updateUserStatus(userId: string, isActive: boolean): Observable<unknown> {
        return this.http.patch(`${this.apiUrl}/${userId}/status`, { isActive }).pipe(
            tap(() => {
                this._users.update((current) =>
                    current.map((u) => (u.id === userId ? { ...u, isActive } : u))
                );
            })
        );
    }
}
