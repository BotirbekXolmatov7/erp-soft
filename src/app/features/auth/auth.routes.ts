import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

export default [
    { path: 'login', component: LoginComponent },
    { path: 'access', loadComponent: () => import('@/app/pages/auth/access').then((m) => m.Access) },
    { path: 'error', loadComponent: () => import('@/app/pages/auth/error').then((m) => m.Error) },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
] as Routes;
