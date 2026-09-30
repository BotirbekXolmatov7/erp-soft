import { Component, OnInit, inject, signal } from '@angular/core';
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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductionService } from '../../services/production.service';
import { ProductService } from '../../../products/services/product.service';
import { Bom, CreateBomDto, CreateBomItemDto } from '../../models/production.model';
import { Product } from '../../../products/models/product.model';

@Component({
    selector: 'app-bom-list',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, TableModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule, DialogModule, TagModule, IconFieldModule, InputIconModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="flex flex-col gap-6">
            <!-- Stat Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- 1. Jami Retseptlar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Jami BOM Retseptlari</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                                {{ productionService.totalBomsCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-sitemap text-blue-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-muted-color">Tayyor mahsulot ishlab chiqarish retseptlari</span>
                </div>

                <!-- 2. Kutilayotgan Buyurtmalar -->
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Jarayondagi Buyurtmalar</span>
                            <div class="text-orange-500 font-bold text-2xl">
                                {{ productionService.pendingOrdersCount() }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 rounded-full w-12 h-12">
                            <i class="pi pi-spin pi-cog text-orange-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-xs text-orange-500 font-medium">Ishlab chiqarishga topshirilgan</span>
                </div>

                <!-- 3. Yakunlangan Buyurtmalar -->
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
                    <span class="text-xs text-muted-color">Tayyor bo'lgan buyurtmalar</span>
                </div>
            </div>

            <!-- Asosiy Card: BOM Ro'yxati -->
            <div class="card shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">Retseptura (BOM — Bill of Materials)</h2>
                        <p class="text-muted-color m-0 text-sm mt-1">Har bir tayyor mahsulotni ishlab chiqarish uchun sarflanadigan xomashyolar tarkibi</p>
                    </div>

                    <div class="flex flex-wrap gap-2 w-full md:w-auto">
                        <p-button label="Yangilash" icon="pi pi-refresh" [text]="true" severity="secondary" (onClick)="loadBoms()"></p-button>
                        <p-button label="Buyurtmalar Ro'yxati" icon="pi pi-list-check" severity="info" [outlined]="true" routerLink="/production/orders"></p-button>
                        <p-button label="Yangi BOM Yaratish" icon="pi pi-plus" severity="primary" (onClick)="openCreateDialog()"></p-button>
                    </div>
                </div>

                <!-- Table with Row Expansion -->
                <p-table
                    #dt
                    [value]="productionService.boms()"
                    [loading]="productionService.isLoading()"
                    dataKey="id"
                    [paginator]="true"
                    [rows]="10"
                    [rowsPerPageOptions]="[10, 25, 50]"
                    [globalFilterFields]="['name', 'finishedProductName', 'finishedProduct.sku']"
                    responsiveLayout="scroll"
                    [tableStyle]="{ 'min-width': '50rem' }"
                >
                    <ng-template #caption>
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-semibold text-muted-color"> Retseptlar ro'yxati ({{ productionService.boms().length }}) </span>
                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search"></p-inputicon>
                                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Nomi yoki mahsulot bo'yicha..." class="w-64" />
                            </p-iconfield>
                        </div>
                    </ng-template>

                    <ng-template #header>
                        <tr>
                            <th style="width: 4rem"></th>
                            <th pSortableColumn="name">Retsept Nomi <p-sortIcon field="name"></p-sortIcon></th>
                            <th pSortableColumn="finishedProductName">Tayyor Mahsulot <p-sortIcon field="finishedProductName"></p-sortIcon></th>
                            <th>SKU</th>
                            <th>O'lchov Birligi</th>
                            <th class="text-center">Xomashyolar Soni</th>
                            <th>Yaratilgan Sana</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-bom let-expanded="expanded">
                        <tr>
                            <td>
                                <p-button type="button" pRowToggler [pRowTogglerDisabled]="false" [text]="true" [rounded]="true" [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></p-button>
                            </td>
                            <td>
                                <span class="font-bold text-surface-900 dark:text-surface-0">
                                    {{ bom.name }}
                                </span>
                            </td>
                            <td>
                                <span class="font-semibold text-primary">
                                    {{ bom.finishedProductName }}
                                </span>
                            </td>
                            <td>
                                <span class="font-mono text-xs text-muted-color bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                                    {{ bom.finishedProduct?.sku || '-' }}
                                </span>
                            </td>
                            <td>{{ bom.finishedProduct?.unit || 'DONA' }}</td>
                            <td class="text-center">
                                <p-tag [value]="(bom.items?.length || 0) + ' ta xomashyo'" severity="info"></p-tag>
                            </td>
                            <td class="text-sm text-muted-color">
                                {{ bom.createdAt | date: 'dd.MM.yyyy HH:mm' }}
                            </td>
                        </tr>
                    </ng-template>

                    <!-- Row Expansion: Xomashyolar tarkibi -->
                    <ng-template #expandedrow let-bom>
                        <tr>
                            <td colspan="7">
                                <div class="p-4 bg-surface-50 dark:bg-surface-800/40 rounded-xl border border-surface-200 dark:border-surface-700 m-2">
                                    <div class="flex items-center gap-2 mb-3">
                                        <i class="pi pi-box text-primary"></i>
                                        <span class="font-bold text-sm text-surface-900 dark:text-surface-0"> 1 dona «{{ bom.finishedProductName }}» uchun talab qilinadigan xomashyolar tarkibi: </span>
                                    </div>

                                    <p-table [value]="bom.items" responsiveLayout="scroll">
                                        <ng-template #header>
                                            <tr>
                                                <th>Xomashyo Nomi</th>
                                                <th>SKU</th>
                                                <th>Talab Qilinadigan Miqdor (1 dona mahsulot uchun)</th>
                                                <th>O'lchov Birligi</th>
                                            </tr>
                                        </ng-template>
                                        <ng-template #body let-item>
                                            <tr>
                                                <td class="font-semibold">{{ item.rawMaterialName }}</td>
                                                <td>
                                                    <span class="font-mono text-xs text-muted-color">
                                                        {{ item.rawMaterial?.sku || '-' }}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span class="font-bold text-orange-600 dark:text-orange-400">
                                                        {{ item.quantityRequired }}
                                                    </span>
                                                </td>
                                                <td>{{ item.unit }}</td>
                                            </tr>
                                        </ng-template>
                                        <ng-template #emptymessage>
                                            <tr>
                                                <td colspan="4" class="text-center p-4 text-muted-color">Ushbu retseptda xomashyo biriktirilmagan.</td>
                                            </tr>
                                        </ng-template>
                                    </p-table>
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="7" class="text-center p-8 text-muted-color">Hech qanday BOM retsepti topilmadi. Yangi retsept qo'shish uchun yuqoridagi tugmani bosing.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Yangi BOM Yaratish Dialogi -->
        <p-dialog [visible]="createDialogVisible" [style]="{ width: '650px' }" header="Yangi Retseptura (BOM) Yaratish" [modal]="true" class="p-fluid" (visibleChange)="createDialogVisible = $event">
            <ng-template #content>
                <form [formGroup]="bomForm" class="flex flex-col gap-4 mt-2">
                    <!-- Retsept Nomi -->
                    <div class="flex flex-col gap-2">
                        <label for="name" class="font-semibold text-surface-900 dark:text-surface-0"> Retsept Nomi * </label>
                        <input id="name" type="text" pInputText formControlName="name" placeholder="Masalan: Standart Stol ishlab chiqarish" class="w-full" />
                        @if (isFieldInvalid('name')) {
                            <small class="text-red-500 font-medium">Retsept nomi kiritilishi shart</small>
                        }
                    </div>

                    <!-- Tayyor Mahsulot -->
                    <div class="flex flex-col gap-2">
                        <label for="finishedProductId" class="font-semibold text-surface-900 dark:text-surface-0"> Tayyor Mahsulot * </label>
                        <p-select
                            id="finishedProductId"
                            formControlName="finishedProductId"
                            [options]="finishedProducts()"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Tayyor mahsulotni tanlang"
                            [filter]="true"
                            filterBy="name,sku"
                            [fluid]="true"
                        >
                            <ng-template #item let-p>
                                <div class="flex justify-between items-center w-full">
                                    <span class="font-medium">{{ p.name }}</span>
                                    <span class="text-xs text-muted-color">({{ p.sku }}) - {{ p.unit }}</span>
                                </div>
                            </ng-template>
                        </p-select>
                        @if (isFieldInvalid('finishedProductId')) {
                            <small class="text-red-500 font-medium">Tayyor mahsulot tanlanishi shart</small>
                        }
                    </div>

                    <!-- Xomashyolar Ro'yxati (FormArray) -->
                    <div class="mt-2">
                        <div class="flex justify-between items-center mb-3">
                            <span class="font-bold text-surface-900 dark:text-surface-0"> Kerakli Xomashyolar Ro'yxati * </span>
                            <p-button label="Xomashyo Qo'shish" icon="pi pi-plus" size="small" severity="secondary" [outlined]="true" (onClick)="addRawMaterialItem()"></p-button>
                        </div>

                        <div formArrayName="items" class="flex flex-col gap-3">
                            @for (itemGroup of itemsFormArray.controls; track $index) {
                                <div [formGroupName]="$index" class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 flex flex-col md:flex-row items-center gap-3">
                                    <!-- Xomashyoni tanlash -->
                                    <div class="flex-1 w-full">
                                        <p-select formControlName="rawMaterialId" [options]="rawMaterials()" optionLabel="name" optionValue="id" placeholder="Xomashyo tanlang" [filter]="true" filterBy="name,sku" [fluid]="true">
                                            <ng-template #item let-rm>
                                                <div class="flex justify-between items-center w-full">
                                                    <span>{{ rm.name }}</span>
                                                    <span class="text-xs text-muted-color">({{ rm.sku }}) - {{ rm.unit }}</span>
                                                </div>
                                            </ng-template>
                                        </p-select>
                                    </div>

                                    <!-- Miqdori -->
                                    <div class="w-full md:w-36">
                                        <p-inputnumber formControlName="quantityRequired" [min]="0.001" placeholder="Sarf miqdori" [fluid]="true"></p-inputnumber>
                                    </div>

                                    <!-- O'chirish -->
                                    <div>
                                        <p-button icon="pi pi-trash" severity="danger" [text]="true" [disabled]="itemsFormArray.length <= 1" (onClick)="removeRawMaterialItem($index)"></p-button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </form>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button label="Bekor qilish" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="createDialogVisible = false"></p-button>
                    <p-button label="BOM Saqlash" icon="pi pi-check" [loading]="submitting()" (onClick)="saveBom()"></p-button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class BomListComponent implements OnInit {
    readonly productionService = inject(ProductionService);
    readonly productService = inject(ProductService);
    private readonly fb = inject(FormBuilder);
    private readonly messageService = inject(MessageService);

    createDialogVisible = false;
    readonly submitting = signal<boolean>(false);

    readonly finishedProducts = signal<Product[]>([]);
    readonly rawMaterials = signal<Product[]>([]);

    readonly bomForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        finishedProductId: ['', [Validators.required]],
        items: this.fb.array([])
    });

    get itemsFormArray(): FormArray {
        return this.bomForm.get('items') as FormArray;
    }

    ngOnInit(): void {
        this.loadBoms();
        this.loadProductsCatalog();
    }

    loadBoms(): void {
        this.productionService.loadBoms().subscribe({
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || "BOM ro'yxatini yuklashda xatolik yuz berdi."
                });
            }
        });
        // Buyurtmalar statistikasini ham yuklaymiz
        this.productionService.loadOrders().subscribe();
    }

    loadProductsCatalog(): void {
        this.productService.loadProducts().subscribe({
            next: (products) => {
                this.finishedProducts.set(products.filter((p) => p.type === 'FINISHED_GOOD'));
                this.rawMaterials.set(products.filter((p) => p.type === 'RAW_MATERIAL'));
            }
        });
    }

    openCreateDialog(): void {
        this.bomForm.reset({
            name: '',
            finishedProductId: ''
        });
        this.itemsFormArray.clear();
        this.addRawMaterialItem(); // Kamida 1 ta xomashyo qatori bilan boshlaymiz
        this.createDialogVisible = true;
    }

    addRawMaterialItem(): void {
        const itemGroup = this.fb.group({
            rawMaterialId: ['', [Validators.required]],
            quantityRequired: [1, [Validators.required, Validators.min(0.001)]]
        });
        this.itemsFormArray.push(itemGroup);
    }

    removeRawMaterialItem(index: number): void {
        if (this.itemsFormArray.length > 1) {
            this.itemsFormArray.removeAt(index);
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.bomForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    saveBom(): void {
        if (this.bomForm.invalid) {
            this.bomForm.markAllAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Ogohlantirish',
                detail: "Iltimos, retsept nomi, mahsulot va barcha xomashyolarni to'liq to'ldiring."
            });
            return;
        }

        const formValue = this.bomForm.value;
        const items: CreateBomItemDto[] = formValue.items.map((i: any) => ({
            rawMaterialId: i.rawMaterialId,
            quantityRequired: Number(i.quantityRequired)
        }));

        const dto: CreateBomDto = {
            name: formValue.name.trim(),
            finishedProductId: formValue.finishedProductId,
            items
        };

        this.submitting.set(true);
        this.productionService.createBom(dto).subscribe({
            next: () => {
                this.submitting.set(false);
                this.createDialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Muvaffaqiyatli',
                    detail: 'Yangi BOM retsepti muvaffaqiyatli saqlandi.'
                });
            },
            error: (err) => {
                this.submitting.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || 'BOM saqlashda xatolik yuz berdi.'
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
