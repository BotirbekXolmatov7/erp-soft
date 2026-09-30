import { Routes } from '@angular/router';
import { AppLayoutComponent } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/core/guards/auth.guard';
import { permissionGuard } from './app/core/guards/permission.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', component: Dashboard },
            {
                path: 'products',
                loadChildren: () => import('./app/features/products/products.routes'),
                canActivate: [permissionGuard],
                data: { permission: 'products:read' }
            },
            {
                path: 'warehouse',
                loadChildren: () => import('./app/features/warehouse/warehouse.routes'),
                canActivate: [permissionGuard],
                data: { permissions: ['warehouse:read', 'WAREHOUSE_VIEW'] }
            },
            {
                path: 'sales',
                loadChildren: () => import('./app/features/sales/sales.routes'),
                canActivate: [permissionGuard],
                data: { permission: 'SALES_VIEW' }
            },
            {
                path: 'production',
                loadChildren: () => import('./app/features/production/production.routes'),
                canActivate: [permissionGuard],
                data: { permission: 'PRODUCTION_VIEW' }
            },
            {
                path: 'users',
                loadChildren: () => import('./app/features/users/users.routes'),
                canActivate: [permissionGuard],
                data: { permission: 'USERS_VIEW' }
            },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/features/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
