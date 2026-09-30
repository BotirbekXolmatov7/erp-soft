import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './component/app.menuitem';
import { AuthService } from '../core/services/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            @for (item of menuItems(); track item.label) {
                @if (item.visible !== false) {
                    @if (!item.separator) {
                        <li app-menuitem [item]="item" [root]="true"></li>
                    } @else {
                        <li class="menu-separator"></li>
                    }
                }
            }
        </ul>
    `
})
export class AppMenuComponent {
    private readonly authService = inject(AuthService);

    // Dynamic reactive menu driven by AuthService signals and permissions
    readonly menuItems = computed<MenuItem[]>(() => {
        // Track currentUser signal so permissions update dynamically upon login/logout/profile update
        this.authService.currentUser();

        const canViewProducts = this.authService.hasPermission('products:read') || this.authService.hasPermission('PRODUCTS_VIEW');
        const canViewWarehouse = this.authService.hasPermission('warehouse:read') || this.authService.hasPermission('WAREHOUSE_VIEW');
        const canViewSales = this.authService.hasPermission('sales:read') || this.authService.hasPermission('SALES_VIEW');
        const canViewProduction = this.authService.hasPermission('production:read') || this.authService.hasPermission('PRODUCTION_VIEW');
        const canViewUsers = this.authService.hasPermission('users:read') || this.authService.hasPermission('USERS_VIEW');

        const erpItems: MenuItem[] = [
            {
                label: 'Mahsulotlar',
                icon: 'pi pi-fw pi-box',
                routerLink: ['/products'],
                visible: canViewProducts
            },
            {
                label: 'Omborxona',
                icon: 'pi pi-fw pi-building',
                routerLink: ['/warehouse'],
                visible: canViewWarehouse
            },
            {
                label: 'Savdo va Moliya',
                icon: 'pi pi-fw pi-shopping-cart',
                routerLink: ['/sales'],
                visible: canViewSales
            },
            {
                label: 'Ishlab chiqarish',
                icon: 'pi pi-fw pi-cog',
                routerLink: ['/production'],
                visible: canViewProduction
            }
        ];

        const hasErpAccess = erpItems.some((item) => item.visible !== false);

        return [
            {
                label: 'Bosh sahifa',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/']
                    }
                ]
            },
            {
                label: 'ERP Modullari',
                visible: hasErpAccess,
                items: erpItems
            },
            {
                label: "Ma'muriyat",
                visible: canViewUsers,
                items: [
                    {
                        label: 'Foydalanuvchilar',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/users'],
                        visible: canViewUsers
                    }
                ]
            }
        ];
    });

    // Backward compatibility for components reading model property directly
    get model(): MenuItem[] {
        return this.menuItems();
    }
}
