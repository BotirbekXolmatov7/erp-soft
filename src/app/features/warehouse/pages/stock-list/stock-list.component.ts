import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { WarehouseService } from '../../services/warehouse.service';
import { MovementDialogComponent } from '../../components/movement-dialog/movement-dialog.component';
import { StockItem } from '../../models/warehouse.model';

@Component({
    selector: 'app-stock-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TableModule, ToolbarModule, ButtonModule, InputTextModule, TagModule, IconFieldModule, InputIconModule, ToastModule, MovementDialogComponent],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="flex flex-col gap-6">
            <!-- Stat Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- 1. Jami Mahsulotlar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Jami Mahsulotlar</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                                {{ warehouseService.totalItemsCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-box text-blue-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-muted-color">Katalogda mavjud pozitsiyalar</span>
                </div>

                <!-- 2. Tanqislikdagi Mahsulotlar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Tanqislikdagi Tovarlar</span>
                            <div class="text-red-500 font-bold text-2xl">
                                {{ warehouseService.lowStockCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-exclamation-triangle text-red-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-red-500 font-medium">Minimal zaxiradan kam qolgan</span>
                </div>

                <!-- 3. Jami Ombor Zaxirasi -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Jami Ombor Qoldig'i</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                                {{ warehouseService.totalStockQuantity() | number: '1.0-2' }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-building text-green-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-muted-color">Barcha birliklardagi umumiy yig'indi</span>
                </div>
            </div>

            <!-- Asosiy Card: Zaxiralar Jadvali -->
            <div class="card shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">Ombor Zaxiralari va Qoldiqlari</h2>
                        <p class="text-muted-color m-0 text-sm mt-1">Har bir mahsulot bo'yicha joriy qoldiqlar va minimal zaxira holati</p>
                    </div>

                    <div class="flex flex-wrap gap-2 w-full md:w-auto">
                        <p-button label="Yangilash" icon="pi pi-refresh" [text]="true" severity="secondary" (onClick)="loadStocks()"></p-button>
                        <p-button label="Harakatlar Jurnali" icon="pi pi-history" severity="info" [outlined]="true" routerLink="/warehouse/history"></p-button>
                        <p-button label="Kirim / Chiqim Qilish" icon="pi pi-arrow-right-arrow-left" severity="primary" (onClick)="openMovementDialog()"></p-button>
                    </div>
                </div>

                <!-- Table -->
                <p-table
                    #dt
                    [value]="warehouseService.stocks()"
                    [loading]="warehouseService.isLoading()"
                    [paginator]="true"
                    [rows]="10"
                    [rowsPerPageOptions]="[10, 25, 50]"
                    [globalFilterFields]="['productName', 'sku']"
                    responsiveLayout="scroll"
                    [tableStyle]="{ 'min-width': '50rem' }"
                >
                    <ng-template #caption>
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-semibold text-muted-color"> Mahsulotlar ro'yxati ({{ warehouseService.stocks().length }}) </span>
                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search"></p-inputicon>
                                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Nomi yoki SKU bo'yicha qidirish..." class="w-64" />
                            </p-iconfield>
                        </div>
                    </ng-template>

                    <ng-template #header>
                        <tr>
                            <th pSortableColumn="productName">Mahsulot Nomi <p-sortIcon field="productName"></p-sortIcon></th>
                            <th pSortableColumn="sku">SKU <p-sortIcon field="sku"></p-sortIcon></th>
                            <th>Birlik</th>
                            <th pSortableColumn="minStockLevel">Minimal Zaxira <p-sortIcon field="minStockLevel"></p-sortIcon></th>
                            <th pSortableColumn="currentQuantity">Ombordagi Qoldiq <p-sortIcon field="currentQuantity"></p-sortIcon></th>
                            <th>Holat</th>
                            <th class="text-center" style="width: 140px">Amallar</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-item>
                        <tr [ngClass]="{ 'bg-red-50/50 dark:bg-red-950/20': item.isLowStock }">
                            <td>
                                <span class="font-semibold text-surface-900 dark:text-surface-0">
                                    {{ item.productName }}
                                </span>
                            </td>
                            <td>
                                <span class="font-mono text-xs text-muted-color bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                                    {{ item.sku }}
                                </span>
                            </td>
                            <td>{{ item.unit }}</td>
                            <td>{{ item.minStockLevel }} {{ item.unit }}</td>
                            <td>
                                <span class="text-base font-bold" [ngClass]="item.isLowStock ? 'text-red-500' : 'text-surface-900 dark:text-surface-0'"> {{ item.currentQuantity }} {{ item.unit }} </span>
                            </td>
                            <td>
                                @if (item.isLowStock) {
                                    <p-tag value="Tanqislik" severity="danger" icon="pi pi-exclamation-triangle"></p-tag>
                                } @else {
                                    <p-tag value="Yetarli" severity="success" icon="pi pi-check"></p-tag>
                                }
                            </td>
                            <td class="text-center">
                                <p-button icon="pi pi-arrow-right-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="openMovementForProduct(item)"></p-button>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="7" class="text-center p-8 text-muted-color">Omborda hech qanday mahsulot yoki qoldiq ma'lumoti topilmadi.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Harakat Dialogi -->
        <app-movement-dialog [(visible)]="movementDialogVisible" [preselectedProductId]="selectedProductId()" (saved)="onMovementSaved()"></app-movement-dialog>
    `
})
export class StockListComponent implements OnInit {
    readonly warehouseService = inject(WarehouseService);
    private readonly messageService = inject(MessageService);

    movementDialogVisible = false;
    readonly selectedProductId = signal<string | null>(null);

    ngOnInit(): void {
        this.loadStocks();
    }

    loadStocks(): void {
        this.warehouseService.loadStocks().subscribe({
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || "Zaxiralar ro'yxatini yuklashda xatolik yuz berdi."
                });
            }
        });
    }

    openMovementDialog(): void {
        this.selectedProductId.set(null);
        this.movementDialogVisible = true;
    }

    openMovementForProduct(item: StockItem): void {
        this.selectedProductId.set(item.productId);
        this.movementDialogVisible = true;
    }

    onMovementSaved(): void {
        this.loadStocks();
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
