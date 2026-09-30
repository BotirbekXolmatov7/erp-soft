import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { WarehouseService } from '../../services/warehouse.service';
import { MovementDialogComponent } from '../../components/movement-dialog/movement-dialog.component';
import { StockMovement, StockMovementReason } from '../../models/warehouse.model';

@Component({
    selector: 'app-movement-history',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, SelectModule, SelectButtonModule, IconFieldModule, InputIconModule, ToastModule, MovementDialogComponent],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="flex flex-col gap-6">
            <!-- Asosiy Card: Harakatlar Jurnali -->
            <div class="card shadow-sm border border-surface-200 dark:border-surface-700">
                <!-- Sarlavha va Navigatsiya -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <p-button icon="pi pi-arrow-left" label="Qoldiqlarga Qaytish" [text]="true" size="small" severity="secondary" routerLink="/warehouse"></p-button>
                        </div>
                        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">Ombor Harakatlari Jurnali</h2>
                        <p class="text-muted-color m-0 text-sm mt-1">Barcha tovarlar kirimi, chiqimi va ichki inventarizatsiya tranzaksiyalari tarixi</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <p-button label="Yangilash" icon="pi pi-refresh" [text]="true" severity="secondary" (onClick)="loadHistory()"></p-button>
                        <p-button label="Yangi Harakat" icon="pi pi-plus" severity="primary" (onClick)="movementDialogVisible = true"></p-button>
                    </div>
                </div>

                <!-- Filterlar paneli -->
                <div class="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div class="flex flex-wrap items-center gap-4">
                        <!-- Turi bo'yicha filter -->
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold text-muted-color">Turi:</span>
                            <p-selectbutton [options]="typeFilterOptions" [ngModel]="selectedTypeFilter()" (ngModelChange)="selectedTypeFilter.set($event)" optionLabel="label" optionValue="value" [allowEmpty]="false"></p-selectbutton>
                        </div>

                        <!-- Sababi bo'yicha filter -->
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold text-muted-color">Sababi:</span>
                            <p-select [options]="reasonFilterOptions" [ngModel]="selectedReasonFilter()" (ngModelChange)="selectedReasonFilter.set($event)" optionLabel="label" optionValue="value" placeholder="Barcha sabablar" class="w-48"></p-select>
                        </div>
                    </div>

                    <!-- Global Qidiruv -->
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search"></p-inputicon>
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Qidirish (Nomi, SKU, Izoh)..." class="w-64" />
                    </p-iconfield>
                </div>

                <!-- Table -->
                <p-table
                    #dt
                    [value]="filteredMovements()"
                    [loading]="warehouseService.isLoading()"
                    [paginator]="true"
                    [rows]="10"
                    [rowsPerPageOptions]="[10, 25, 50]"
                    [globalFilterFields]="['productName', 'sku', 'referenceId', 'notes']"
                    responsiveLayout="scroll"
                    [tableStyle]="{ 'min-width': '55rem' }"
                >
                    <ng-template #header>
                        <tr>
                            <th pSortableColumn="createdAt" style="width: 170px">Sana va Vaqt <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th pSortableColumn="productName">Mahsulot <p-sortIcon field="productName"></p-sortIcon></th>
                            <th pSortableColumn="type" style="width: 130px">Harakat Turi <p-sortIcon field="type"></p-sortIcon></th>
                            <th pSortableColumn="quantity" style="width: 140px">Miqdori <p-sortIcon field="quantity"></p-sortIcon></th>
                            <th style="width: 180px">Sababi</th>
                            <th>Hujjat Raqami</th>
                            <th>Izoh</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-item>
                        <tr>
                            <td class="text-sm text-muted-color whitespace-nowrap">
                                {{ item.createdAt | date: 'dd.MM.yyyy HH:mm' }}
                            </td>
                            <td>
                                <div class="font-semibold text-surface-900 dark:text-surface-0">
                                    {{ item.productName }}
                                </div>
                                <div class="text-xs font-mono text-muted-color">SKU: {{ item.sku }}</div>
                            </td>
                            <td>
                                @if (item.type === 'IN') {
                                    <p-tag value="KIRIM" severity="success" icon="pi pi-arrow-down-left"></p-tag>
                                } @else {
                                    <p-tag value="CHIQIM" severity="warn" icon="pi pi-arrow-up-right"></p-tag>
                                }
                            </td>
                            <td>
                                <span class="font-bold text-base" [ngClass]="item.type === 'IN' ? 'text-green-600' : 'text-orange-500'"> {{ item.type === 'IN' ? '+' : '-' }}{{ item.quantity }} {{ item.unit }} </span>
                            </td>
                            <td>
                                <span class="text-sm font-medium">
                                    {{ getReasonLabel(item.reason) }}
                                </span>
                            </td>
                            <td>
                                <span class="font-mono text-xs text-muted-color">
                                    {{ item.referenceId || '-' }}
                                </span>
                            </td>
                            <td class="text-sm text-muted-color">
                                {{ item.notes || '-' }}
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="7" class="text-center p-8 text-muted-color">Belgilangan shartlar bo'yicha hech qanday harakat topilmadi.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Yangi Harakat Dialogi -->
        <app-movement-dialog [(visible)]="movementDialogVisible" (saved)="onMovementSaved()"></app-movement-dialog>
    `
})
export class MovementHistoryComponent implements OnInit {
    readonly warehouseService = inject(WarehouseService);
    private readonly messageService = inject(MessageService);

    movementDialogVisible = false;

    // Filter signallari
    readonly selectedTypeFilter = signal<'ALL' | 'IN' | 'OUT'>('ALL');
    readonly selectedReasonFilter = signal<string>('ALL');

    readonly typeFilterOptions = [
        { label: 'Hammasi', value: 'ALL' },
        { label: 'Kirim (IN)', value: 'IN' },
        { label: 'Chiqim (OUT)', value: 'OUT' }
    ];

    readonly reasonFilterOptions = [
        { label: 'Barcha sabablar', value: 'ALL' },
        { label: 'Yetkazib beruvchidan xarid', value: 'PURCHASE' },
        { label: 'Mijozga sotuv', value: 'SALE' },
        { label: 'Ishlab chiqarishdan kirim', value: 'PRODUCTION_IN' },
        { label: 'Ishlab chiqarishga sarf', value: 'PRODUCTION_OUT' },
        { label: 'Tuzatish / Qayta hisob', value: 'ADJUSTMENT' }
    ];

    readonly filteredMovements = computed<StockMovement[]>(() => {
        let list = this.warehouseService.movements();
        const type = this.selectedTypeFilter();
        const reason = this.selectedReasonFilter();

        if (type !== 'ALL') {
            list = list.filter((m) => m.type === type);
        }
        if (reason !== 'ALL') {
            list = list.filter((m) => m.reason === reason);
        }
        return list;
    });

    ngOnInit(): void {
        this.loadHistory();
    }

    loadHistory(): void {
        this.warehouseService.loadMovements().subscribe({
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || 'Harakatlar tarixini yuklashda xatolik yuz berdi.'
                });
            }
        });
    }

    onMovementSaved(): void {
        this.loadHistory();
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getReasonLabel(reason: StockMovementReason): string {
        switch (reason) {
            case 'PURCHASE':
                return 'Xarid';
            case 'SALE':
                return 'Sotuv';
            case 'PRODUCTION_IN':
                return 'Ishlab chiqarishdan';
            case 'PRODUCTION_OUT':
                return 'Ishlab chiqarishga';
            case 'ADJUSTMENT':
                return 'Tuzatish / Inventar';
            default:
                return reason;
        }
    }
}
