import { Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { authGuard } from '@/app/core/guards/auth.guard';
import { permissionGuard } from '@/app/core/guards/permission.guard';

export default [
    {
        path: '',
        component: ProductListComponent,
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'products:read' }
    }
] as Routes;
