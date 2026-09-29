import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/app/core/services/auth.service';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        RippleModule,
        ToastModule,
        AppFloatingConfigurator
    ],
    providers: [MessageService],
    template: `
        <p-toast />
        <app-floating-configurator />

        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-16 px-8 sm:px-20" style="border-radius: 53px">
                        <!-- Header / Logo -->
                        <div class="text-center mb-8">
                            <div class="inline-flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 rounded-2xl w-16 h-16 mb-4 text-primary">
                                <i class="pi pi-building text-3xl"></i>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-bold mb-2">ERP Enterprise</div>
                            <span class="text-muted-color font-medium">Tizimga kirish uchun hisob ma'lumotlaringizni kiriting</span>
                        </div>

                        <!-- Login Form -->
                        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
                            <!-- Email -->
                            <div class="flex flex-col gap-2">
                                <label for="email" class="text-surface-900 dark:text-surface-0 font-medium">Elektron pochta</label>
                                <input
                                    pInputText
                                    id="email"
                                    type="email"
                                    formControlName="email"
                                    placeholder="nomingiz@kompaniya.uz"
                                    class="w-full md:w-96"
                                    [class.ng-dirty]="isFieldInvalid('email')"
                                />
                                @if (isFieldInvalid('email')) {
                                    <small class="text-red-500 font-medium">To'g'ri elektron pochta manzilini kiriting</small>
                                }
                            </div>

                            <!-- Password -->
                            <div class="flex flex-col gap-2">
                                <label for="password" class="text-surface-900 dark:text-surface-0 font-medium">Parol</label>
                                <p-password
                                    id="password"
                                    formControlName="password"
                                    placeholder="••••••••"
                                    [toggleMask]="true"
                                    [feedback]="false"
                                    [fluid]="true"
                                    styleClass="w-full md:w-96"
                                    [class.ng-dirty]="isFieldInvalid('password')"
                                ></p-password>
                                @if (isFieldInvalid('password')) {
                                    <small class="text-red-500 font-medium">Parolni kiritish majburiy (kamida 6 belgi)</small>
                                }
                            </div>

                            <!-- Remember me & Forgot Password -->
                            <div class="flex items-center justify-between mt-2 mb-2 gap-4">
                                <div class="flex items-center">
                                    <p-checkbox formControlName="rememberMe" id="rememberMe" [binary]="true" class="mr-2"></p-checkbox>
                                    <label for="rememberMe" class="text-surface-900 dark:text-surface-0 cursor-pointer select-none">Meni eslab qol</label>
                                </div>
                                <a routerLink="/auth/error" class="text-primary hover:underline font-medium text-sm">Parolni unutdingizmi?</a>
                            </div>

                            <!-- Submit Button -->
                            <p-button
                                type="submit"
                                label="Kirish"
                                icon="pi pi-sign-in"
                                [loading]="loading()"
                                styleClass="w-full py-3 font-semibold"
                            ></p-button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly messageService = inject(MessageService);

    readonly loading = signal<boolean>(false);

    readonly loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        rememberMe: [false]
    });

    isFieldInvalid(fieldName: string): boolean {
        const control = this.loginForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Ogohlantirish',
                detail: 'Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring.'
            });
            return;
        }

        this.loading.set(true);
        const credentials = this.loginForm.value;

        this.authService.login(credentials).subscribe({
            next: () => {
                this.loading.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Muvaffaqiyatli',
                    detail: 'Tizimga muvaffaqiyatli kirdingiz.'
                });

                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                this.router.navigateByUrl(returnUrl);
            },
            error: (err) => {
                this.loading.set(false);
                const errorMessage = err?.error?.message || 'Login yoki parol noto\'g\'ri. Qaytadan urinib ko\'ring.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Kirishda xatolik',
                    detail: errorMessage
                });
            }
        });
    }
}
