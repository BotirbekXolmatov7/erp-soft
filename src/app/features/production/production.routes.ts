import { Routes } from '@angular/router';
import { BomListComponent } from './pages/bom-list/bom-list.component';
import { ProductionOrdersComponent } from './pages/production-orders/production-orders.component';

export default [
    { path: '', component: ProductionListComponent }
] as Routes;
