import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserManagementService } from '../../services/user-management.service';
import { CompanyUser, CreateCompanyUserDto } from '../../models/user-management.model';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        SelectModule,
        DialogModule,
        TagModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule,
        ToastModule
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast></p-toast>
        <p-confirmdialog></p-confirmdialog>

        <div class="flex flex-col gap-6">
            <!-- Stat Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- 1. Jami Xodimlar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Jami Xodimlar</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                                {{ userManagementService.totalUsersCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-users text-blue-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-muted-color">Kompaniyaning ro'yxatdan o'tgan foydalanuvchilari</span>
                </div>

                <!-- 2. Faol Xodimlar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Faol Xodimlar</span>
                            <div class="text-green-600 font-bold text-2xl">
                                {{ userManagementService.activeUsersCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-user-check text-green-600 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-green-600 font-medium">Tizimga kirish huquqiga ega</span>
                </div>

                <!-- 3. Bloklangan Xodimlar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Bloklangan (Nofaol)</span>
                            <div class="text-red-500 font-bold text-2xl">
                                {{ userManagementService.inactiveUsersCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-user-minus text-red-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-red-500 font-medium">Kirishi vaqtincha cheklangan</span>
                </div>
            </div>

            <!-- Asosiy Card: Xodimlar Jadvali -->
            <div class="card shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">
                            Kompaniya Xodimlari Boshqaruvi
                        </h2>
                        <p class="text-muted-color m-0 text-sm mt-1">
                            Kompaniyangizdagi foydalanuvchilar, ularning rollari va tizimga kirish ruxsatnomalari
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-2 w-full md:w-auto">
                        <p-button
                            label="Yangilash"
                            icon="pi pi-refresh"
                            [text]="true"
                            severity="secondary"
                            (onClick)="loadUsers()"
                        ></p-button>
                        <p-button
                            label="Yangi Xodim Qo'shish"
                            icon="pi pi-user-plus"
                            severity="primary"
                            (onClick)="openCreateDialog()"
                        ></p-button>
                    </div>
                </div>

                <!-- Table -->
                <p-table
                    #dt
                    [value]="userManagementService.users()"
                    [loading]="userManagementService.isLoading()"
                    [paginator]="true"
                    [rows]="10"
                    [rowsPerPageOptions]="[10, 25, 50]"
                    [globalFilterFields]="['fullName', 'email', 'role.name', 'role.code']"
                    responsiveLayout="scroll"
                    [tableStyle]="{ 'min-width': '55rem' }"
                >
                    <ng-template #caption>
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-semibold text-muted-color">
                                Xodimlar ro'yxati ({{ userManagementService.users().length }})
                            </span>
                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search"></p-inputicon>
                                <input
                                    pInputText
                                    type="text"
                                    (input)="onGlobalFilter(dt, $event)"
                                    placeholder="F.I.Sh yoki Email bo'yicha qidirish..."
                                    class="w-64"
                                />
                            </p-iconfield>
                        </div>
                    </ng-template>

                    <ng-template #header>
                        <tr>
                            <th pSortableColumn="fullName">
                                F.I.Sh <p-sortIcon field="fullName"></p-sortIcon>
                            </th>
                            <th pSortableColumn="email">
                                Email <p-sortIcon field="email"></p-sortIcon>
                            </th>
                            <th pSortableColumn="role.name" style="width: 180px">
                                Tizimdagi Roli <p-sortIcon field="role.name"></p-sortIcon>
                            </th>
                            <th pSortableColumn="isActive" style="width: 140px">
                                Holati <p-sortIcon field="isActive"></p-sortIcon>
                            </th>
                            <th pSortableColumn="createdAt" style="width: 170px">
                                Ro'yxatdan O'tgan <p-sortIcon field="createdAt"></p-sortIcon>
                            </th>
                            <th class="text-center" style="width: 180px">Amallar</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-user>
                        <tr [ngClass]="{ 'opacity-60 bg-surface-100/50 dark:bg-surface-800/30': !user.isActive }">
                            <td>
                                <div class="font-bold text-surface-900 dark:text-surface-0">
                                    {{ user.fullName }}
                                </div>
                                @if (user.isSuperAdmin) {
                                    <span class="text-xs text-orange-500 font-bold block">Tizim Super Admini</span>
                                }
                            </td>
                            <td>
                                <span class="font-mono text-sm text-muted-color">
                                    {{ user.email }}
                                </span>
                            </td>
                            <td>
                                <p-tag
                                    [value]="user.role?.name || user.role?.code || 'Xodim'"
                                    [severity]="getRoleSeverity(user.role?.code)"
                                ></p-tag>
                            </td>
                            <td>
                                @if (user.isActive) {
                                    <p-tag
                                        value="FAOL"
                                        severity="success"
                                        icon="pi pi-check-circle"
                                    ></p-tag>
                                } @else {
                                    <p-tag
                                        value="BLOKLANGAN"
                                        severity="danger"
                                        icon="pi pi-ban"
                                    ></p-tag>
                                }
                            </td>
                            <td class="text-sm text-muted-color whitespace-nowrap">
                                {{ user.createdAt | date:'dd.MM.yyyy HH:mm' }}
                            </td>
                            <td class="text-center">
                                @if (user.isActive) {
                                    <p-button
                                        label="Bloklash"
                                        icon="pi pi-ban"
                                        size="small"
                                        severity="danger"
                                        [outlined]="true"
                                        (onClick)="toggleUserStatus(user)"
                                    ></p-button>
                                } @else {
                                    <p-button
                                        label="Faollashtirish"
                                        icon="pi pi-check"
                                        size="small"
                                        severity="success"
                                        [outlined]="true"
                                        (onClick)="toggleUserStatus(user)"
                                    ></p-button>
                                }
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="6" class="text-center p-8 text-muted-color">
                                Kompaniyada hech qanday xodim topilmadi.
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Yangi Xodim Qo'shish Dialogi -->
        <p-dialog
            [visible]="createDialogVisible"
            [style]="{ width: '520px' }"
            header="Yangi Kompaniya Xodimi Qo'shish"
            [modal]="true"
            class="p-fluid"
            (visibleChange)="createDialogVisible = $event"
        >
            <ng-template #content>
                <form [formGroup]="userForm" class="flex flex-col gap-4 mt-2">
                    <!-- F.I.Sh -->
                    <div class="flex flex-col gap-2">
                        <label for="fullName" class="font-semibold text-surface-900 dark:text-surface-0">
                            F.I.Sh (To'liq ismi) *
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            pInputText
                            formControlName="fullName"
                            placeholder="Masalan: Jamshid Usmonov"
                            class="w-full"
                        />
                        @if (isFieldInvalid('fullName')) {
                            <small class="text-red-500 font-medium">To'liq ism kiritilishi shart (kamida 2 ta belgi)</small>
                        }
                    </div>

                    <!-- Email -->
                    <div class="flex flex-col gap-2">
                        <label for="email" class="font-semibold text-surface-900 dark:text-surface-0">
                            Elektron Pochta (Email) *
                        </label>
                        <input
                            id="email"
                            type="email"
                            pInputText
                            formControlName="email"
                            placeholder="xodim@kompaniya.uz"
                            class="w-full"
                        />
                        @if (isFieldInvalid('email')) {
                            <small class="text-red-500 font-medium">To'g'ri email manzil kiriting</small>
                        }
                    </div>

                    <!-- Parol -->
                    <div class="flex flex-col gap-2">
                        <label for="password" class="font-semibold text-surface-900 dark:text-surface-0">
                            Boshlang'ich Parol *
                        </label>
                        <p-password
                            id="password"
                            formControlName="password"
                            [feedback]="false"
                            [toggleMask]="true"
                            placeholder="Kamida 6 ta belgi"
                            [fluid]="true"
                        ></p-password>
                        @if (isFieldInvalid('password')) {
                            <small class="text-red-500 font-medium">Parol kamida 6 ta belgidan iborat bo'lishi kerak</small>
                        }
                    </div>

                    <!-- Rol -->
                    <div class="flex flex-col gap-2">
                        <label for="roleId" class="font-semibold text-surface-900 dark:text-surface-0">
                            Tizimdagi Roli *
                        </label>
                        <p-select
                            id="roleId"
                            formControlName="roleId"
                            [options]="userManagementService.roles()"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Rolni tanlang"
                            [fluid]="true"
                        >
                            <ng-template #item let-role>
                                <div class="flex justify-between items-center w-full">
                                    <span class="font-medium">{{ role.name }}</span>
                                    <span class="text-xs font-mono text-muted-color">({{ role.code }})</span>
                                </div>
                            </ng-template>
                        </p-select>
                        @if (isFieldInvalid('roleId')) {
                            <small class="text-red-500 font-medium">Xodim uchun rol tanlanishi shart</small>
                        }
                    </div>
                </form>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button
                        label="Bekor qilish"
                        icon="pi pi-times"
                        [text]="true"
                        severity="secondary"
                        (onClick)="createDialogVisible = false"
                    ></p-button>
                    <p-button
                        label="Xodimni Saqlash"
                        icon="pi pi-check"
                        [loading]="submitting()"
                        (onClick)="saveUser()"
                    ></p-button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class UserListComponent implements OnInit {
    readonly userManagementService = inject(UserManagementService);
    private readonly fb = inject(FormBuilder);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly messageService = inject(MessageService);

    createDialogVisible = false;
    readonly submitting = signal<boolean>(false);

    readonly userForm: FormGroup = this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        roleId: [null, [Validators.required]]
    });

    ngOnInit(): void {
        this.loadUsers();
        this.loadRoles();
    }

    loadUsers(): void {
        this.userManagementService.loadUsers().subscribe({
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || "Xodimlar ro'yxatini yuklashda xatolik yuz berdi."
                });
            }
        });
    }

    loadRoles(): void {
        this.userManagementService.loadRoles().subscribe();
    }

    openCreateDialog(): void {
        this.userForm.reset({
            fullName: '',
            email: '',
            password: '',
            roleId: null
        });
        this.createDialogVisible = true;
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.userForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    saveUser(): void {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Ogohlantirish',
                detail: "Iltimos, barcha maydonlarni to'g'ri to'ldiring."
            });
            return;
        }

        const dto: CreateCompanyUserDto = this.userForm.value;
        this.submitting.set(true);

        this.userManagementService.createUser(dto).subscribe({
            next: () => {
                this.submitting.set(false);
                this.createDialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Muvaffaqiyatli',
                    detail: 'Yangi xodim muvaffaqiyatli ro\'yxatdan o\'tkazildi.'
                });
            },
            error: (err) => {
                this.submitting.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || 'Xodimni qo\'shishda xatolik yuz berdi.'
                });
            }
        });
    }

    toggleUserStatus(user: CompanyUser): void {
        const newStatus = !user.isActive;
        const actionWord = newStatus ? 'faollashtirishni' : 'bloklashni';

        this.confirmationService.confirm({
            header: newStatus ? 'Xodimni faollashtirish' : 'Xodimni bloklash',
            message: `«${user.fullName}» (${user.email}) hisobini ${actionWord} istaysizmi?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: newStatus ? 'Ha, faollashtirish' : 'Ha, bloklash',
            rejectLabel: 'Bekor qilish',
            acceptButtonStyleClass: newStatus ? 'p-button-success' : 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary p-button-text',
            accept: () => {
                this.userManagementService.updateUserStatus(user.id, newStatus).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Muvaffaqiyatli',
                            detail: `Xodim hisobi muvaffaqiyatli ${newStatus ? 'faollashtirildi' : 'bloklandi'}.`
                        });
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Xatolik',
                            detail: err?.error?.message || 'Statusni o\'zgartirishda xatolik yuz berdi.'
                        });
                    }
                });
            }
        });
    }

    getRoleSeverity(roleCode?: string): 'info' | 'warn' | 'success' | 'secondary' {
        if (!roleCode) return 'secondary';
        if (roleCode.includes('ADMIN')) return 'warn';
        if (roleCode.includes('MANAGER')) return 'info';
        return 'success';
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
