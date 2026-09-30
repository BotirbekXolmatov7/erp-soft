import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { SalesService } from '../../services/sales.service';
import { ProductService } from '../../../products/services/product.service';
import { CreateSalesOrderDto, CreateSalesOrderItemDto, SalesOrder } from '../../models/sales.model';
import { Product } from '../../../products/models/product.model';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        DialogModule,
        TagModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule,
        ToastModule
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast></p-toast>
        <p-confirmdialog></p-confirmdialog>

        <div class="flex flex-col gap-6">
            <!-- Stat Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- 1. Jami Tushum -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Tasdiqlangan Savdo Summasi</span>
                            <div class="text-green-600 font-bold text-2xl">
                                {{ salesService.totalRevenue() | number:'1.0-0' }} so'm
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-wallet text-green-600 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-green-600 font-medium">Ombordan chiqim qilingan savdolar</span>
                </div>

                <!-- 2. Qoralama (Kutilayotgan) Savdolar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Qoralama (Kutilayotgan)</span>
                            <div class="text-orange-500 font-bold text-2xl">
                                {{ salesService.draftOrdersCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-hourglass text-orange-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-orange-500 font-medium">Tasdiqlanishi kutilayotgan buyurtmalar</span>
                </div>

                <!-- 3. Jami Buyurtmalar Soni -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Jami Buyurtmalar</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                                {{ salesService.totalOrdersCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-shopping-cart text-blue-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-muted-color">Barcha mijozlar buyurtmalari soni</span>
                </div>
            </div>

            <!-- Asosiy Card: Savdolar Jadvali -->
            <div class="card shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">
                            Savdo Buyurtmalari
                        </h2>
                        <p class="text-muted-color m-0 text-sm mt-1">
                            Mijozlar bilan tuzilgan savdo shartnomalari va ombordan tovar chiqimlari nazorati
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-2 w-full md:w-auto">
                        <p-button
                            label="Yangilash"
                            icon="pi pi-refresh"
                            [text]="true"
                            severity="secondary"
                            (onClick)="loadOrders()"
                        ></p-button>
                        <p-button
                            label="Yangi Savdo Ochish"
                            icon="pi pi-plus"
                            severity="primary"
                            (onClick)="openCreateDialog()"
                        ></p-button>
                    </div>
                </div>

                <!-- Table with Row Expansion -->
                <p-table
                    #dt
                    [value]="salesService.orders()"
                    [loading]="salesService.isLoading()"
                    dataKey="id"
                    [paginator]="true"
                    [rows]="10"
                    [rowsPerPageOptions]="[10, 25, 50]"
                    [globalFilterFields]="['id', 'customerName']"
                    responsiveLayout="scroll"
                    [tableStyle]="{ 'min-width': '55rem' }"
                >
                    <ng-template #caption>
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-semibold text-muted-color">
                                Buyurtmalar ro'yxati ({{ salesService.orders().length }})
                            </span>
                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search"></p-inputicon>
                                <input
                                    pInputText
                                    type="text"
                                    (input)="onGlobalFilter(dt, $event)"
                                    placeholder="Mijoz yoki ID bo'yicha qidirish..."
                                    class="w-64"
                                />
                            </p-iconfield>
                        </div>
                    </ng-template>

                    <ng-template #header>
                        <tr>
                            <th style="width: 4rem"></th>
                            <th style="width: 140px">Buyurtma #</th>
                            <th pSortableColumn="customerName">
                                Mijoz Nomi <p-sortIcon field="customerName"></p-sortIcon>
                            </th>
                            <th pSortableColumn="totalAmount">
                                Jami Summa <p-sortIcon field="totalAmount"></p-sortIcon>
                            </th>
                            <th pSortableColumn="status" style="width: 160px">
                                Holati <p-sortIcon field="status"></p-sortIcon>
                            </th>
                            <th pSortableColumn="createdAt" style="width: 170px">
                                Sana <p-sortIcon field="createdAt"></p-sortIcon>
                            </th>
                            <th class="text-center" style="width: 190px">Amallar</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-order let-expanded="expanded">
                        <tr>
                            <td>
                                <p-button
                                    type="button"
                                    pRowToggler
                                    [pRowTogglerDisabled]="false"
                                    [text]="true"
                                    [rounded]="true"
                                    [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                                ></p-button>
                            </td>
                            <td>
                                <span class="font-mono text-xs font-semibold text-muted-color">
                                    #{{ order.id.slice(0, 8) }}
                                </span>
                            </td>
                            <td>
                                <span class="font-bold text-surface-900 dark:text-surface-0">
                                    {{ order.customerName }}
                                </span>
                            </td>
                            <td>
                                <span class="font-bold text-base text-primary">
                                    {{ order.totalAmount | number:'1.0-0' }} so'm
                                </span>
                            </td>
                            <td>
                                @if (order.status === 'DRAFT') {
                                    <p-tag
                                        value="QORALAMA"
                                        severity="warn"
                                        icon="pi pi-pencil"
                                    ></p-tag>
                                } @else if (order.status === 'CONFIRMED') {
                                    <p-tag
                                        value="TASDIQLANGAN"
                                        severity="success"
                                        icon="pi pi-check-circle"
                                    ></p-tag>
                                } @else {
                                    <p-tag
                                        value="BEKOR QILINGAN"
                                        severity="danger"
                                        icon="pi pi-times"
                                    ></p-tag>
                                }
                            </td>
                            <td class="text-sm text-muted-color whitespace-nowrap">
                                {{ order.createdAt | date:'dd.MM.yyyy HH:mm' }}
                            </td>
                            <td class="text-center">
                                @if (order.status === 'DRAFT') {
                                    <p-button
                                        label="Tasdiqlash"
                                        icon="pi pi-check"
                                        size="small"
                                        severity="success"
                                        [loading]="confirmingOrderId() === order.id"
                                        (onClick)="confirmOrder(order)"
                                    ></p-button>
                                } @else {
                                    <span class="text-xs text-muted-color italic">Chiqim qilingan</span>
                                }
                            </td>
                        </tr>
                    </ng-template>

                    <!-- Row Expansion: Mahsulotlar savati tarkibi -->
                    <ng-template #expandedrow let-order>
                        <tr>
                            <td colspan="7">
                                <div class="p-4 bg-surface-50 dark:bg-surface-800/40 rounded-xl border border-surface-200 dark:border-surface-700 m-2">
                                    <div class="flex items-center gap-2 mb-3">
                                        <i class="pi pi-shopping-bag text-primary"></i>
                                        <span class="font-bold text-sm text-surface-900 dark:text-surface-0">
                                            Buyurtma tarkibidagi tovarlar:
                                        </span>
                                    </div>

                                    <p-table [value]="order.items" responsiveLayout="scroll">
                                        <ng-template #header>
                                            <tr>
                                                <th>Mahsulot</th>
                                                <th>SKU</th>
                                                <th>Miqdori</th>
                                                <th>Birlik Narxi</th>
                                                <th>Oraliq Summa</th>
                                            </tr>
                                        </ng-template>
                                        <ng-template #body let-item>
                                            <tr>
                                                <td class="font-semibold">{{ item.productName }}</td>
                                                <td>
                                                    <span class="font-mono text-xs text-muted-color">
                                                        {{ item.sku }}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span class="font-bold">
                                                        {{ item.quantity }} {{ item.unit }}
                                                    </span>
                                                </td>
                                                <td>{{ item.unitPrice | number:'1.0-0' }} so'm</td>
                                                <td>
                                                    <span class="font-bold text-primary">
                                                        {{ item.totalPrice | number:'1.0-0' }} so'm
                                                    </span>
                                                </td>
                                            </tr>
                                        </ng-template>
                                    </p-table>
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="7" class="text-center p-8 text-muted-color">
                                Hech qanday savdo buyurtmasi topilmadi.
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Yangi Savdo Ochish Dialogi -->
        <p-dialog
            [visible]="createDialogVisible"
            [style]="{ width: '700px' }"
            header="Yangi Savdo Buyurtmasi Ochish"
            [modal]="true"
            class="p-fluid"
            (visibleChange)="createDialogVisible = $event"
        >
            <ng-template #content>
                <form [formGroup]="orderForm" class="flex flex-col gap-4 mt-2">
                    <!-- Mijoz Nomi -->
                    <div class="flex flex-col gap-2">
                        <label for="customerName" class="font-semibold text-surface-900 dark:text-surface-0">
                            Mijoz (Kontragent) Nomi *
                        </label>
                        <input
                            id="customerName"
                            type="text"
                            pInputText
                            formControlName="customerName"
                            placeholder="Masalan: «Grand Savdo» MCHJ yoki Alisher Zokirov"
                            class="w-full"
                        />
                        @if (isFieldInvalid('customerName')) {
                            <small class="text-red-500 font-medium">Mijoz nomi kiritilishi shart</small>
                        }
                    </div>

                    <!-- Mahsulotlar Savati (FormArray) -->
                    <div class="mt-2">
                        <div class="flex justify-between items-center mb-3">
                            <span class="font-bold text-surface-900 dark:text-surface-0">
                                Sotiladigan Mahsulotlar *
                            </span>
                            <p-button
                                label="Mahsulot Qo'shish"
                                icon="pi pi-plus"
                                size="small"
                                severity="secondary"
                                [outlined]="true"
                                (onClick)="addProductItem()"
                            ></p-button>
                        </div>

                        <div formArrayName="items" class="flex flex-col gap-3">
                            @for (itemGroup of itemsFormArray.controls; track $index) {
                                <div [formGroupName]="$index" class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 flex flex-col md:flex-row items-center gap-3">
                                    <!-- Mahsulot tanlash -->
                                    <div class="flex-1 w-full">
                                        <p-select
                                            formControlName="productId"
                                            [options]="productsList()"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Mahsulotni tanlang"
                                            [filter]="true"
                                            filterBy="name,sku"
                                            [fluid]="true"
                                            (onChange)="onProductSelected($index, $event.value)"
                                        >
                                            <ng-template #item let-p>
                                                <div class="flex justify-between items-center w-full">
                                                    <div>
                                                        <span class="font-medium">{{ p.name }}</span>
                                                        <span class="text-xs text-muted-color block">SKU: {{ p.sku }}</span>
                                                    </div>
                                                    <span class="text-xs font-semibold text-primary">
                                                        Qoldiq: {{ p.currentStock }} {{ p.unit }}
                                                    </span>
                                                </div>
                                            </ng-template>
                                        </p-select>
                                    </div>

                                    <!-- Soni -->
                                    <div class="w-full md:w-28">
                                        <p-inputnumber
                                            formControlName="quantity"
                                            [min]="1"
                                            placeholder="Miqdor"
                                            [fluid]="true"
                                        ></p-inputnumber>
                                    </div>

                                    <!-- Narxi -->
                                    <div class="w-full md:w-36">
                                        <p-inputnumber
                                            formControlName="unitPrice"
                                            [min]="0"
                                            placeholder="Narx (so'm)"
                                            [fluid]="true"
                                        ></p-inputnumber>
                                    </div>

                                    <!-- Oraliq Jami -->
                                    <div class="w-full md:w-32 text-right">
                                        <span class="text-xs text-muted-color block">Jami:</span>
                                        <span class="font-bold text-sm text-surface-900 dark:text-surface-0">
                                            {{ (getItemSubtotal($index) | number:'1.0-0') }} so'm
                                        </span>
                                    </div>

                                    <!-- O'chirish -->
                                    <div>
                                        <p-button
                                            icon="pi pi-trash"
                                            severity="danger"
                                            [text]="true"
                                            [disabled]="itemsFormArray.length <= 1"
                                            (onClick)="removeProductItem($index)"
                                        ></p-button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>

                    <!-- Umumiy savat jami summasi -->
                    <div class="p-4 bg-surface-100 dark:bg-surface-800 rounded-lg flex justify-between items-center border border-surface-200 dark:border-surface-700 mt-2">
                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">
                            Umumiy Buyurtma Summasi:
                        </span>
                        <span class="font-bold text-xl text-primary">
                            {{ calculateOrderTotal() | number:'1.0-0' }} so'm
                        </span>
                    </div>
                </form>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button
                        label="Bekor qilish"
                        icon="pi pi-times"
                        [text]="true"
                        severity="secondary"
                        (onClick)="createDialogVisible = false"
                    ></p-button>
                    <p-button
                        label="Savdo Ochish"
                        icon="pi pi-check"
                        [loading]="submitting()"
                        (onClick)="saveOrder()"
                    ></p-button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class OrderListComponent implements OnInit {
    readonly salesService = inject(SalesService);
    readonly productService = inject(ProductService);
    private readonly fb = inject(FormBuilder);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly messageService = inject(MessageService);

    createDialogVisible = false;
    readonly submitting = signal<boolean>(false);
    readonly confirmingOrderId = signal<string | null>(null);

    readonly productsList = signal<Product[]>([]);

    readonly orderForm: FormGroup = this.fb.group({
        customerName: ['', [Validators.required, Validators.minLength(2)]],
        items: this.fb.array([])
    });

    get itemsFormArray(): FormArray {
        return this.orderForm.get('items') as FormArray;
    }

    ngOnInit(): void {
        this.loadOrders();
        this.loadProducts();
    }

    loadOrders(): void {
        this.salesService.loadOrders().subscribe({
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || "Savdo buyurtmalarini yuklashda xatolik yuz berdi."
                });
            }
        });
    }

    loadProducts(): void {
        this.productService.loadProducts().subscribe({
            next: (data) => {
                this.productsList.set(data);
            }
        });
    }

    openCreateDialog(): void {
        this.orderForm.reset({
            customerName: ''
        });
        this.itemsFormArray.clear();
        this.addProductItem();
        this.createDialogVisible = true;
    }

    addProductItem(): void {
        const itemGroup = this.fb.group({
            productId: ['', [Validators.required]],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [0, [Validators.required, Validators.min(0)]]
        });
        this.itemsFormArray.push(itemGroup);
    }

    removeProductItem(index: number): void {
        if (this.itemsFormArray.length > 1) {
            this.itemsFormArray.removeAt(index);
        }
    }

    onProductSelected(index: number, productId: string): void {
        const product = this.productsList().find((p) => p.id === productId);
        if (product && product.price) {
            const group = this.itemsFormArray.at(index);
            group.patchValue({ unitPrice: product.price });
        }
    }

    getItemSubtotal(index: number): number {
        const group = this.itemsFormArray.at(index);
        const qty = Number(group.get('quantity')?.value || 0);
        const price = Number(group.get('unitPrice')?.value || 0);
        return qty * price;
    }

    calculateOrderTotal(): number {
        let sum = 0;
        for (let i = 0; i < this.itemsFormArray.length; i++) {
            sum += this.getItemSubtotal(i);
        }
        return sum;
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
                detail: "Iltimos, mijoz nomi va barcha mahsulotlar qatorlarini to'g'ri to'ldiring."
            });
            return;
        }

        const formValue = this.orderForm.value;
        const items: CreateSalesOrderItemDto[] = formValue.items.map((i: any) => ({
            productId: i.productId,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice)
        }));

        const dto: CreateSalesOrderDto = {
            customerName: formValue.customerName.trim(),
            items
        };

        this.submitting.set(true);
        this.salesService.createOrder(dto).subscribe({
            next: () => {
                this.submitting.set(false);
                this.createDialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Muvaffaqiyatli',
                    detail: 'Yangi savdo buyurtmasi qoralama sifatida saqlandi.'
                });
            },
            error: (err) => {
                this.submitting.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || 'Savdo buyurtmasini saqlashda xatolik yuz berdi.'
                });
            }
        });
    }

    /**
     * ConfirmationService orqali savdoni tasdiqlash va ombordan chiqarish
     */
    confirmOrder(order: SalesOrder): void {
        this.confirmationService.confirm({
            header: 'Savdoni tasdiqlash va Chiqim qilish',
            message: `«${order.customerName}» uchun ochilgan #${order.id.slice(0, 8)} savdo buyurtmasini tasdiqlaysizmi? Buyurtmadagi barcha tovarlar avtomatik tarzda ombordan chiqim qilinadi.`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Ha, tasdiqlash',
            rejectLabel: 'Bekor qilish',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary p-button-text',
            accept: () => {
                this.confirmingOrderId.set(order.id);
                this.salesService.confirmOrder(order.id).subscribe({
                    next: () => {
                        this.confirmingOrderId.set(null);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Tasdiqlandi',
                            detail: "Savdo muvaffaqiyatli tasdiqlandi va ombordan tovarlar chiqim qilindi."
                        });
                    },
                    error: (err) => {
                        this.confirmingOrderId.set(null);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Xatolik',
                            detail: err?.error?.message || 'Savdoni tasdiqlashda xatolik yuz berdi.'
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
