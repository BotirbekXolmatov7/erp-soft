import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Warehouse } from '../models/warehouse.model';

@Injectable({
    providedIn: 'root'
})
export class WarehouseService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/warehouse';

    getWarehouses(): Observable<Warehouse[]> {
        return this.http.get<Warehouse[]>(this.apiUrl);
    }
}
