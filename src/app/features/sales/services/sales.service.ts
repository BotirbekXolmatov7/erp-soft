import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map, tap } from 'rxjs';
import { CreateSalesOrderDto, SalesOrder } from '../models/sales.model';

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/sales';

    // Reactive State Management using Angular Signals
    private readonly _orders = signal<SalesOrder[]>([]);
    private readonly _isLoading = signal<boolean>(false);

    readonly orders = this._orders.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();

    // Computed metrics for dashboard and cards
    readonly totalOrdersCount = computed(() => this._orders().length);
    readonly draftOrdersCount = computed(
        () => this._orders().filter((o) => o.status === 'DRAFT').length
    );
    readonly confirmedOrdersCount = computed(
        () => this._orders().filter((o) => o.status === 'CONFIRMED').length
    );
    readonly totalRevenue = computed(() =>
        this._orders()
            .filter((o) => o.status === 'CONFIRMED')
            .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
    );

    /**
     * Barcha savdo buyurtmalarini yuklash
     */
    loadOrders(): Observable<SalesOrder[]> {
        this._isLoading.set(true);
        return this.http.get<SalesOrder[]>(this.apiUrl).pipe(
            map((items) =>
                items.map((order) => ({
                    ...order,
                    totalAmount: Number(order.totalAmount || 0),
                    items: (order.items || []).map((item) => ({
                        ...item,
                        productName: item.product?.name || "Noma'lum mahsulot",
                        sku: item.product?.sku || '-',
                        unit: item.product?.unit || 'DONA',
                        quantity: Number(item.quantity || 0),
                        unitPrice: Number(item.unitPrice || 0),
                        totalPrice: Number(item.quantity || 0) * Number(item.unitPrice || 0)
                    }))
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
     * Yangi savdo buyurtmasini ochish
     */
    createOrder(dto: CreateSalesOrderDto): Observable<SalesOrder> {
        this._isLoading.set(true);
        return this.http.post<SalesOrder>(this.apiUrl, dto).pipe(
            tap(() => {
                this.loadOrders().subscribe();
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }

    /**
     * Savdo buyurtmasini tasdiqlash va tovarlarni ombordan avtomatik chiqarish (OUT)
     */
    confirmOrder(orderId: string): Observable<unknown> {
        this._isLoading.set(true);
        return this.http.post(`${this.apiUrl}/${orderId}/confirm`, {}).pipe(
            tap(() => {
                this.loadOrders().subscribe();
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }
}
