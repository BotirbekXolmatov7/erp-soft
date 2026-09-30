import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, map, switchMap, tap } from 'rxjs';
import { CreateMovementDto, StockItem, StockMovement, StockTransactionResponse } from '../models/warehouse.model';

@Injectable({
    providedIn: 'root'
})
export class WarehouseService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/warehouse';

    // Reactive State Management using Angular Signals
    private readonly _stocks = signal<StockItem[]>([]);
    private readonly _movements = signal<StockMovement[]>([]);
    private readonly _isLoading = signal<boolean>(false);

    readonly stocks = this._stocks.asReadonly();
    readonly movements = this._movements.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();

    // Computed metrics for cards and badges
    readonly lowStockCount = computed(() => this._stocks().filter((s) => s.isLowStock).length);
    readonly totalItemsCount = computed(() => this._stocks().length);
    readonly totalStockQuantity = computed(() => this._stocks().reduce((sum, item) => sum + (item.currentQuantity || 0), 0));

    /**
     * Barcha mahsulotlar va ombor qoldiqlarini yuklash
     */
    loadStocks(): Observable<StockItem[]> {
        this._isLoading.set(true);
        return this.http.get<StockItem[]>(`${this.apiUrl}/stocks`).pipe(
            map((items) =>
                items.map((item) => ({
                    ...item,
                    currentQuantity: Number(item.currentQuantity ?? 0),
                    minStockLevel: Number(item.minStockLevel ?? 0),
                    isLowStock: Number(item.currentQuantity ?? 0) <= Number(item.minStockLevel ?? 0)
                }))
            ),
            tap((mappedStocks) => {
                this._stocks.set(mappedStocks);
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }

    /**
     * Kirim va chiqimlar tarixi jurnalini yuklash
     */
    loadMovements(filters?: { type?: string; reason?: string; limit?: number }): Observable<StockMovement[]> {
        this._isLoading.set(true);
        let params = new HttpParams();

        if (filters?.type) {
            params = params.set('type', filters.type);
        }
        if (filters?.reason) {
            params = params.set('reason', filters.reason);
        }
        if (filters?.limit) {
            params = params.set('limit', filters.limit.toString());
        } else {
            params = params.set('limit', '50');
        }

        return this.http.get<StockTransactionResponse>(`${this.apiUrl}/movements`, { params }).pipe(
            map((response) => {
                const list = response?.data ?? [];
                return list.map((item) => ({
                    id: item.id,
                    productId: item.productId,
                    productName: item.product?.name || "Noma'lum mahsulot",
                    sku: item.product?.sku || '-',
                    unit: item.product?.unit || 'DONA',
                    quantity: Number(item.quantity),
                    type: item.type,
                    reason: item.reason,
                    referenceId: item.referenceId,
                    notes: item.notes,
                    createdAt: item.createdAt
                }));
            }),
            tap((mappedMovements) => {
                this._movements.set(mappedMovements);
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }

    /**
     * Yangi kirim yoki chiqim harakatini qayd etish
     */
    recordMovement(dto: CreateMovementDto): Observable<unknown> {
        this._isLoading.set(true);
        return this.http.post(`${this.apiUrl}/movement`, dto).pipe(
            switchMap((res) =>
                this.loadStocks().pipe(
                    switchMap(() => this.loadMovements()),
                    map(() => res)
                )
            ),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }
}
