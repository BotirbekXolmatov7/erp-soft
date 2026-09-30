import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProductService } from '../../services/product.service';
import { CreateProductDto, Product, ProductType, ProductUnit } from '../../models/product.model';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TableModule, ToolbarModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule, DialogModule, TagModule, ToastModule, IconFieldModule, InputIconModule],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />

        <div class="card">
            <!-- Sarlavha -->
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="m-0 text-2xl font-bold text-surface-900 dark:text-surface-0">Mahsulotlar Katalogi</h3>
                    <p class="text-muted-color m-0 mt-1">Xomashyo va tayyor mahsulotlar qoldiqlarini boshqarish</p>
                </div>
            </div>

            <!-- Toolbar: Yangi mahsulot va Qidiruv -->
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <p-button label="Yangi mahsulot" icon="pi pi-plus" severity="primary" class="mr-2" (onClick)="openNew()" />
                    <p-button label="Yangilash" icon="pi pi-refresh" severity="secondary" [outlined]="true" (onClick)="loadProducts()" />
                </ng-template>

                <ng-template #end>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Qidiruv (Nomi, SKU)..." class="w-full sm:w-80" />
                    </p-iconfield>
                </ng-template>
            </p-toolbar>

            <!-- Asosiy Mahsulotlar Jadvali -->
            <p-table
                #dt
                [value]="productService.products()"
                [loading]="productService.isLoading()"
                [rows]="10"
                [paginator]="true"
                [rowsPerPageOptions]="[10, 25, 50]"
                [globalFilterFields]="['name', 'sku', 'unit', 'type']"
                [tableStyle]="{ 'min-width': '65rem' }"
                [rowHover]="true"
                dataKey="id"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="{first} - {last} dan {totalRecords} ta mahsulot ko'rsatilmoqda"
            >
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="sku" style="width: 14%">SKU / Kod <p-sortIcon field="sku" /></th>
                        <th pSortableColumn="name" style="width: 24%">Mahsulot nomi <p-sortIcon field="name" /></th>
                        <th pSortableColumn="type" style="width: 16%">Turi <p-sortIcon field="type" /></th>
                        <th pSortableColumn="unit" style="width: 10%">Birlik <p-sortIcon field="unit" /></th>
                        <th pSortableColumn="price" style="width: 14%">Narxi <p-sortIcon field="price" /></th>
                        <th pSortableColumn="currentStock" style="width: 12%">Qoldiq <p-sortIcon field="currentStock" /></th>
                        <th pSortableColumn="minStockLevel" style="width: 10%">Min. Zaxira <p-sortIcon field="minStockLevel" /></th>
                    </tr>
                </ng-template>

                <ng-template #body let-product>
                    <tr>
                        <td class="font-mono text-sm font-semibold">{{ product.sku }}</td>
                        <td class="font-medium text-surface-900 dark:text-surface-0">{{ product.name }}</td>
                        <td>
                            <p-tag [value]="getTypeLabel(product.type)" [severity]="getTypeSeverity(product.type)" />
                        </td>
                        <td>
                            <span class="inline-block px-2 py-1 rounded text-xs bg-surface-100 dark:bg-surface-800 font-medium">
                                {{ product.unit }}
                            </span>
                        </td>
                        <td class="font-semibold">{{ product.price | number: '1.0-2' }} so'm</td>
                        <td>
                            <div class="flex items-center gap-2">
                                <span [class.text-red-500]="product.currentStock <= product.minStockLevel" [class.font-bold]="product.currentStock <= product.minStockLevel">
                                    {{ product.currentStock | number }}
                                </span>
                                @if (product.currentStock <= product.minStockLevel) {
                                    <i class="pi pi-exclamation-triangle text-red-500 text-xs" title="Minimal zaxiradan kam!"></i>
                                }
                            </div>
                        </td>
                        <td class="text-muted-color">
                            {{ product.minStockLevel | number }}
                        </td>
                    </tr>
                </ng-template>

                <ng-template #emptymessage>
                    <tr>
                        <td colspan="7" class="text-center py-8 text-muted-color">
                            <i class="pi pi-box text-4xl block mb-2 opacity-50"></i>
                            Mahsulotlar topilmadi.
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Yangi Mahsulot Qo'shish Dialogi -->
        <p-dialog [(visible)]="productDialog" [style]="{ width: '480px' }" header="Yangi mahsulot yaratish" [modal]="true" [draggable]="false" [resizable]="false">
            <ng-template #content>
                <form [formGroup]="productForm" class="flex flex-col gap-4 pt-2">
                    <!-- Nomi -->
                    <div class="flex flex-col gap-2">
                        <label for="name" class="font-semibold text-surface-900 dark:text-surface-0">Mahsulot nomi *</label>
                        <input pInputText id="name" formControlName="name" placeholder="Masalan: Paxta tolasi yoki Erkaklar ko'ylagi" [class.ng-dirty]="isFieldInvalid('name')" />
                        @if (isFieldInvalid('name')) {
                            <small class="text-red-500 font-medium">Mahsulot nomi kiritilishi shart</small>
                        }
                    </div>

                    <!-- SKU -->
                    <div class="flex flex-col gap-2">
                        <label for="sku" class="font-semibold text-surface-900 dark:text-surface-0">SKU / Artikuli *</label>
                        <input pInputText id="sku" formControlName="sku" placeholder="Masalan: RAW-001 yoki PRD-102" [class.ng-dirty]="isFieldInvalid('sku')" />
                        @if (isFieldInvalid('sku')) {
                            <small class="text-red-500 font-medium">SKU kiritilishi shart</small>
                        }
                    </div>

                    <!-- Turi va O'lchov birligi (2 ustun) -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label for="type" class="font-semibold text-surface-900 dark:text-surface-0">Turi *</label>
                            <p-select id="type" formControlName="type" [options]="typeOptions" optionLabel="label" optionValue="value" placeholder="Turni tanlang" [fluid]="true" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="unit" class="font-semibold text-surface-900 dark:text-surface-0">O'lchov birligi *</label>
                            <p-select id="unit" formControlName="unit" [options]="unitOptions" optionLabel="label" optionValue="value" placeholder="Birlikni tanlang" [fluid]="true" />
                        </div>
                    </div>

                    <!-- Narxi -->
                    <div class="flex flex-col gap-2">
                        <label for="price" class="font-semibold text-surface-900 dark:text-surface-0">Narxi (so'mda) *</label>
                        <p-inputnumber id="price" formControlName="price" [min]="0" placeholder="0.00" [fluid]="true" />
                        @if (isFieldInvalid('price')) {
                            <small class="text-red-500 font-medium">Musbat narx kiriting</small>
                        }
                    </div>

                    <!-- Minimal Zaxira va Boshlang'ich qoldiq (2 ustun) -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label for="minStockLevel" class="font-semibold text-surface-900 dark:text-surface-0">Min. Zaxira *</label>
                            <p-inputnumber id="minStockLevel" formControlName="minStockLevel" [min]="0" placeholder="0" [fluid]="true" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="currentStock" class="font-semibold text-surface-900 dark:text-surface-0">Boshlang'ich qoldiq</label>
                            <p-inputnumber id="currentStock" formControlName="currentStock" [min]="0" placeholder="0" [fluid]="true" />
                        </div>
                    </div>
                </form>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button label="Bekor qilish" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="hideDialog()" />
                    <p-button label="Saqlash" icon="pi pi-check" [loading]="submitting()" (onClick)="saveProduct()" />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class ProductListComponent implements OnInit {
    readonly productService = inject(ProductService);
    private readonly fb = inject(FormBuilder);
    private readonly messageService = inject(MessageService);

    productDialog = false;
    readonly submitting = signal<boolean>(false);

    readonly typeOptions = [
        { label: 'Xomashyo (RAW_MATERIAL)', value: 'RAW_MATERIAL' },
        { label: 'Tayyor mahsulot (FINISHED_GOOD)', value: 'FINISHED_GOOD' }
    ];

    readonly unitOptions = [
        { label: 'Dona (DONA)', value: 'DONA' },
        { label: 'Kilogramm (KG)', value: 'KG' },
        { label: 'Metr (METR)', value: 'METR' }
    ];

    readonly productForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        sku: ['', [Validators.required]],
        type: ['FINISHED_GOOD' as ProductType, [Validators.required]],
        unit: ['DONA' as ProductUnit, [Validators.required]],
        price: [0, [Validators.required, Validators.min(0)]],
        minStockLevel: [10, [Validators.required, Validators.min(0)]],
        currentStock: [0, [Validators.min(0)]]
    });

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.productService.loadProducts().subscribe({
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || 'Mahsulotlarni yuklashda xatolik yuz berdi.'
                });
            }
        });
    }

    openNew(): void {
        this.productForm.reset({
            name: '',
            sku: '',
            type: 'FINISHED_GOOD',
            unit: 'DONA',
            price: 0,
            minStockLevel: 10,
            currentStock: 0
        });
        this.productDialog = true;
    }

    hideDialog(): void {
        this.productDialog = false;
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.productForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    saveProduct(): void {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Ogohlantirish',
                detail: "Iltimos, barcha majburiy maydonlarni to'g'ri to'ldiring."
            });
            return;
        }

        this.submitting.set(true);
        const dto: CreateProductDto = this.productForm.value;

        this.productService.createProduct(dto).subscribe({
            next: () => {
                this.submitting.set(false);
                this.productDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Muvaffaqiyatli',
                    detail: "Yangi mahsulot katalogga muvaffaqiyatli qo'shildi."
                });
            },
            error: (err) => {
                this.submitting.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || 'Mahsulotni saqlashda xatolik yuz berdi.'
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getTypeSeverity(type: ProductType): 'warn' | 'success' {
        return type === 'RAW_MATERIAL' ? 'warn' : 'success';
    }

    getTypeLabel(type: ProductType): string {
        return type === 'RAW_MATERIAL' ? 'Xomashyo' : 'Tayyor mahsulot';
    }
}
