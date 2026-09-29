import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { CreateProductDto, Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/products';

    // Reactive State Management via Angular Signals
    private readonly _products = signal<Product[]>([]);
    private readonly _isLoading = signal<boolean>(false);

    readonly products = this._products.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();

    /**
     * Backenddan mahsulotlar ro'yxati va qoldiqlarini yuklash
     */
    loadProducts(): Observable<Product[]> {
        this._isLoading.set(true);
        return this.http.get<Product[]>(this.apiUrl).pipe(
            tap((data) => {
                this._products.set(data);
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }

    /**
     * Yangi mahsulot yoki xomashyo yaratish
     */
    createProduct(dto: CreateProductDto): Observable<Product> {
        this._isLoading.set(true);
        return this.http.post<Product>(this.apiUrl, dto).pipe(
            tap((newProduct) => {
                // Yangi yaratilgan mahsulotni ro'yxat boshiga qo'shish
                this._products.update((current) => [newProduct, ...current]);
            }),
            finalize(() => {
                this._isLoading.set(false);
            })
        );
    }
}
