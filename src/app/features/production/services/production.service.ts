import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map, tap } from 'rxjs';
import { Bom, CreateBomDto, CreateProductionOrderDto, ProductionOrder } from '../models/production.model';

@Injectable({
    providedIn: 'root'
})
export class ProductionService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/production';

    // Reactive State Management using Angular Signals
    private readonly _boms = signal<Bom[]>([]);
    private readonly _orders = signal<ProductionOrder[]>([]);
    private readonly _isLoading = signal<boolean>(false);

    readonly boms = this._boms.asReadonly();
    readonly orders = this._orders.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();

    // Computed metrics for cards and analytics
    readonly totalBomsCount = computed(() => this._boms().length);
    readonly totalOrdersCount = computed(() => this._orders().length);
    readonly pendingOrdersCount = computed(() => this._orders().filter((o) => o.status === 'PENDING').length);
    readonly completedOrdersCount = computed(() => this._orders().filter((o) => o.status === 'COMPLETED').length);

    /**
     * Barcha BOM (retseptura) ro'yxatini yuklash
     */
    loadBoms(): Observable<Bom[]> {
        this._isLoading.set(true);
        return this.http.get<Bom[]>(`${this.apiUrl}/boms`).pipe(
            map((items) =>
                items.map((bom) => ({
                    ...bom,
                    finishedProductName: bom.finishedProduct?.name || "Noma'lum mahsulot",
                    items: (bom.items || []).map((item) => ({
                        ...item,
                        rawMaterialName: item.rawMaterial?.name || "Noma'lum xomashyo",
                        unit: item.rawMaterial?.unit || 'DONA',
                        quantityRequired: Number(item.quantityRequired)
                    }))
                }))
            ),
            tap((data) => {
                this._boms.set(data);
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }

    /**
     * Yangi BOM (retsept) yaratish
     */
    createBom(dto: CreateBomDto): Observable<Bom> {
        this._isLoading.set(true);
        return this.http.post<Bom>(`${this.apiUrl}/boms`, dto).pipe(
            tap(() => {
                this.loadBoms().subscribe();
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }

    /**
     * Barcha ishlab chiqarish buyurtmalarini yuklash
     */
    loadOrders(): Observable<ProductionOrder[]> {
        this._isLoading.set(true);
        return this.http.get<ProductionOrder[]>(`${this.apiUrl}/orders`).pipe(
            map((items) =>
                items.map((order) => ({
                    ...order,
                    finishedProductName: order.finishedProduct?.name || "Noma'lum mahsulot",
                    quantityToProduce: Number(order.quantityToProduce)
                }))
            ),
            tap((data) => {
                this._orders.set(data);
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }

    /**
     * Yangi ishlab chiqarish buyurtmasi yaratish
     */
    createOrder(dto: CreateProductionOrderDto): Observable<ProductionOrder> {
        this._isLoading.set(true);
        return this.http.post<ProductionOrder>(`${this.apiUrl}/orders`, dto).pipe(
            tap(() => {
                this.loadOrders().subscribe();
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }

    /**
     * Ishlab chiqarish buyurtmasini yakunlash
     * (Ombordan xomashyolarni yechish va tayyor mahsulotni kirim qilish)
     */
    completeOrder(orderId: string): Observable<unknown> {
        this._isLoading.set(true);
        return this.http.post(`${this.apiUrl}/orders/${orderId}/complete`, {}).pipe(
            tap(() => {
                this.loadOrders().subscribe();
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }
}
