import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductionService } from '../../services/production.service';
import { ProductService } from '../../../products/services/product.service';
import { CreateProductionOrderDto, ProductionOrder, ProductionOrderStatus } from '../../models/production.model';
import { Product } from '../../../products/models/product.model';

@Component({
    selector: 'app-production-orders',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, TableModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule, DialogModule, TagModule, ConfirmDialogModule, IconFieldModule, InputIconModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast></p-toast>
        <p-confirmdialog></p-confirmdialog>

        <div class="flex flex-col gap-6">
            <!-- Stat Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- 1. Kutilayotgan Buyurtmalar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Kutilayotgan (Faol)</span>
                            <div class="text-orange-500 font-bold text-2xl">
                                {{ productionService.pendingOrdersCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-clock text-orange-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-orange-500 font-medium">Yakunlanishi kutilayotgan buyurtmalar</span>
                </div>

                <!-- 2. Yakunlangan Buyurtmalar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Muvaffaqiyatli Chiqarilgan</span>
                            <div class="text-green-600 font-bold text-2xl">
                                {{ productionService.completedOrdersCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-check-circle text-green-600 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-green-600 font-medium">Tayyor mahsulot kirim qilingan</span>
                </div>

                <!-- 3. Jami Buyurtmalar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Jami Buyurtmalar</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                                {{ productionService.totalOrdersCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-list text-blue-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-muted-color">Barcha ishlab chiqarish tarixlari</span>
                </div>
            </div>

            <!-- Asosiy Card: Buyurtmalar Jadvali -->
            <div class="card shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <p-button icon="pi pi-arrow-left" label="BOM Retseptlariga Qaytish" [text]="true" size="small" severity="secondary" routerLink="/production"></p-button>
                        </div>
                        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">Ishlab Chiqarish Buyurtmalari</h2>
                        <p class="text-muted-color m-0 text-sm mt-1">Rejadagi va yakunlangan mahsulot ishlab chiqarish topshiriqlari</p>
                    </div>

                    <div class="flex flex-wrap gap-2 w-full md:w-auto">
                        <p-button label="Yangilash" icon="pi pi-refresh" [text]="true" severity="secondary" (onClick)="loadOrders()"></p-button>
                        <p-button label="Yangi Buyurtma Berish" icon="pi pi-plus" severity="primary" (onClick)="openCreateDialog()"></p-button>
                    </div>
                </div>

                <!-- Table -->
                <p-table
                    #dt
                    [value]="productionService.orders()"
                    [loading]="productionService.isLoading()"
                    [paginator]="true"
                    [rows]="10"
                    [rowsPerPageOptions]="[10, 25, 50]"
                    [globalFilterFields]="['id', 'finishedProductName', 'finishedProduct.sku']"
                    responsiveLayout="scroll"
                    [tableStyle]="{ 'min-width': '55rem' }"
                >
                    <ng-template #caption>
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-semibold text-muted-color"> Buyurtmalar ({{ productionService.orders().length }}) </span>
                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search"></p-inputicon>
                                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Mahsulot yoki ID bo'yicha qidirish..." class="w-64" />
                            </p-iconfield>
                        </div>
                    </ng-template>

                    <ng-template #header>
                        <tr>
                            <th style="width: 130px">Buyurtma #</th>
                            <th pSortableColumn="finishedProductName">Ishlab Chiqariladigan Mahsulot <p-sortIcon field="finishedProductName"></p-sortIcon></th>
                            <th>SKU</th>
                            <th pSortableColumn="quantityToProduce" style="width: 160px">Miqdori <p-sortIcon field="quantityToProduce"></p-sortIcon></th>
                            <th pSortableColumn="status" style="width: 150px">Holati <p-sortIcon field="status"></p-sortIcon></th>
                            <th pSortableColumn="createdAt" style="width: 170px">Sana <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th class="text-center" style="width: 180px">Amallar</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-order>
                        <tr>
                            <td>
                                <span class="font-mono text-xs font-semibold text-muted-color"> #{{ order.id.slice(0, 8) }} </span>
                            </td>
                            <td>
                                <span class="font-semibold text-surface-900 dark:text-surface-0">
                                    {{ order.finishedProductName }}
                                </span>
                            </td>
                            <td>
                                <span class="font-mono text-xs text-muted-color bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                                    {{ order.finishedProduct?.sku || '-' }}
                                </span>
                            </td>
                            <td>
                                <span class="font-bold text-base text-primary"> {{ order.quantityToProduce }} {{ order.finishedProduct?.unit || 'DONA' }} </span>
                            </td>
                            <td>
                                @if (order.status === 'PENDING') {
                                    <p-tag value="KUTILMOQDA" severity="warn" icon="pi pi-clock"></p-tag>
                                } @else if (order.status === 'COMPLETED') {
                                    <p-tag value="YAKUNLANGAN" severity="success" icon="pi pi-check-circle"></p-tag>
                                } @else {
                                    <p-tag value="BEKOR QILINGAN" severity="danger" icon="pi pi-times"></p-tag>
                                }
                            </td>
                            <td class="text-sm text-muted-color whitespace-nowrap">
                                {{ order.createdAt | date: 'dd.MM.yyyy HH:mm' }}
                            </td>
                            <td class="text-center">
                                @if (order.status === 'PENDING') {
                                    <p-button label="Yakunlash" icon="pi pi-check" size="small" severity="success" [loading]="completingOrderId() === order.id" (onClick)="confirmComplete(order)"></p-button>
                                } @else {
                                    <span class="text-xs text-muted-color italic">Yakunlangan</span>
                                }
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="7" class="text-center p-8 text-muted-color">Hech qanday ishlab chiqarish buyurtmasi topilmadi.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Yangi Buyurtma Berish Dialogi -->
        <p-dialog [visible]="createDialogVisible" [style]="{ width: '500px' }" header="Yangi Ishlab Chiqarish Buyurtmasi" [modal]="true" class="p-fluid" (visibleChange)="createDialogVisible = $event">
            <ng-template #content>
                <form [formGroup]="orderForm" class="flex flex-col gap-4 mt-2">
                    <!-- Mahsulotni tanlash -->
                    <div class="flex flex-col gap-2">
                        <label for="finishedProductId" class="font-semibold text-surface-900 dark:text-surface-0"> Tayyor Mahsulot (BOM mavjud) * </label>
                        <p-select
                            id="finishedProductId"
                            formControlName="finishedProductId"
                            [options]="availableProductsWithBom()"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Ishlab chiqariladigan tovar"
                            [filter]="true"
                            filterBy="name,sku"
                            [fluid]="true"
                        >
                            <ng-template #item let-p>
                                <div class="flex justify-between items-center w-full">
                                    <span class="font-medium">{{ p.name }}</span>
                                    <span class="text-xs text-muted-color">({{ p.sku }})</span>
                                </div>
                            </ng-template>
                        </p-select>
                        @if (isFieldInvalid('finishedProductId')) {
                            <small class="text-red-500 font-medium">Mahsulot tanlanishi shart</small>
                        }
                    </div>

                    <!-- Miqdori -->
                    <div class="flex flex-col gap-2">
                        <label for="quantityToProduce" class="font-semibold text-surface-900 dark:text-surface-0"> Ishlab Chiqariladigan Miqdor * </label>
                        <p-inputnumber id="quantityToProduce" formControlName="quantityToProduce" [min]="1" placeholder="Masalan: 10" [fluid]="true"></p-inputnumber>
                        @if (isFieldInvalid('quantityToProduce')) {
                            <small class="text-red-500 font-medium">Kamida 1 bo'lishi kerak</small>
                        }
                    </div>
                </form>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button label="Bekor qilish" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="createDialogVisible = false"></p-button>
                    <p-button label="Buyurtma Berish" icon="pi pi-check" [loading]="submitting()" (onClick)="saveOrder()"></p-button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class ProductionOrdersComponent implements OnInit {
    readonly productionService = inject(ProductionService);
    readonly productService = inject(ProductService);
    private readonly fb = inject(FormBuilder);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly messageService = inject(MessageService);

    createDialogVisible = false;
    readonly submitting = signal<boolean>(false);
    readonly completingOrderId = signal<string | null>(null);

    readonly availableProductsWithBom = signal<Product[]>([]);

    readonly orderForm: FormGroup = this.fb.group({
        finishedProductId: ['', [Validators.required]],
        quantityToProduce: [1, [Validators.required, Validators.min(1)]]
    });

    ngOnInit(): void {
        this.loadOrders();
        this.loadAvailableProducts();
    }

    loadOrders(): void {
        this.productionService.loadOrders().subscribe({
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || 'Buyurtmalarni yuklashda xatolik yuz berdi.'
                });
            }
        });
    }

    loadAvailableProducts(): void {
        // Faqat BOM retsepti mavjud bo'lgan tayyor mahsulotlarni tanlashga ruxsat berish
        this.productionService.loadBoms().subscribe({
            next: (boms) => {
                const finishedProductIds = new Set(boms.map((b) => b.finishedProductId));
                this.productService.loadProducts().subscribe({
                    next: (products) => {
                        const filtered = products.filter((p) => p.type === 'FINISHED_GOOD' && finishedProductIds.has(p.id));
                        this.availableProductsWithBom.set(filtered);
                    }
                });
            }
        });
    }

    openCreateDialog(): void {
        this.orderForm.reset({
            finishedProductId: '',
            quantityToProduce: 1
        });
        this.createDialogVisible = true;
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.orderForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    saveOrder(): void {
        if (this.orderForm.invalid) {
            this.orderForm.markAllAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Ogohlantirish',
                detail: "Iltimos, mahsulot va miqdorni to'g'ri tanlang."
            });
            return;
        }

        const formValue = this.orderForm.value;
        const dto: CreateProductionOrderDto = {
            finishedProductId: formValue.finishedProductId,
            quantityToProduce: Number(formValue.quantityToProduce)
        };

        this.submitting.set(true);
        this.productionService.createOrder(dto).subscribe({
            next: () => {
                this.submitting.set(false);
                this.createDialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Muvaffaqiyatli',
                    detail: 'Yangi ishlab chiqarish buyurtmasi qabul qilindi.'
                });
            },
            error: (err) => {
                this.submitting.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || 'Buyurtma yaratishda xatolik yuz berdi.'
                });
            }
        });
    }

    /**
     * PrimeNG ConfirmationService orqali ishlab chiqarishni yakunlash
     */
    confirmComplete(order: ProductionOrder): void {
        this.confirmationService.confirm({
            header: 'Ishlab chiqarishni yakunlash',
            message: `«${order.finishedProductName}» (${order.quantityToProduce} dona) ishlab chiqarishni yakunlamoqchimisiz? Retsept bo'yicha xomashyolar ombordan avtomatik yechiladi va tayyor mahsulot omborga kirim qilinadi.`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Ha, yakunlash',
            rejectLabel: 'Bekor qilish',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary p-button-text',
            accept: () => {
                this.completingOrderId.set(order.id);
                this.productionService.completeOrder(order.id).subscribe({
                    next: () => {
                        this.completingOrderId.set(null);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Yakunlandi',
                            detail: 'Buyurtma muvaffaqiyatli yakunlandi. Xomashyolar sarflandi va tayyor tovar omborga kirim qilindi.'
                        });
                    },
                    error: (err) => {
                        this.completingOrderId.set(null);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Xatolik',
                            detail: err?.error?.message || 'Buyurtmani yakunlashda xatolik yuz berdi.'
                        });
                    }
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
