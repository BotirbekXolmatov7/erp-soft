import { Routes } from '@angular/router';
import { StockListComponent } from './pages/stock-list/stock-list.component';
import { MovementHistoryComponent } from './pages/movement-history/movement-history.component';

export default [
    {
        path: '',
        component: StockListComponent
    },
    {
        path: 'history',
        component: MovementHistoryComponent
    }
] as Routes;
