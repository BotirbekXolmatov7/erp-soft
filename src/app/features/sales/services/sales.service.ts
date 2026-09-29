import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaleOrder } from '../models/sales.model';

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/sales';

    getOrders(): Observable<SaleOrder[]> {
        return this.http.get<SaleOrder[]>(this.apiUrl);
    }
}
