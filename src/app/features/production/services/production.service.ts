import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductionOrder } from '../models/production.model';

@Injectable({
    providedIn: 'root'
})
export class ProductionService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/production';

    getOrders(): Observable<ProductionOrder[]> {
        return this.http.get<ProductionOrder[]>(this.apiUrl);
    }
}
