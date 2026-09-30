import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { WarehouseService } from '../../services/warehouse.service';
import { CreateMovementDto, StockItem, StockMovementReason, StockMovementType } from '../../models/warehouse.model';

@Component({
    selector: 'app-movement-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule, SelectButtonModule, TextareaModule],
    template: `
        <p-dialog [visible]="visible" [style]="{ width: '560px' }" header="Ombor Harakati Qayd Etish" [modal]="true" class="p-fluid" (visibleChange)="onVisibleChange($event)">
            <ng-template #content>
                <form [formGroup]="form" class="flex flex-col gap-4 mt-2">
                    <!-- Harakat turi (KIRIM / CHIQIM) -->
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-surface-900 dark:text-surface-0">Harakat Turi *</label>
                        <p-selectbutton [options]="typeOptions" formControlName="type" optionLabel="label" optionValue="value" [allowEmpty]="false"></p-selectbutton>
                    </div>

                    <!-- Mahsulotni tanlash -->
                    <div class="flex flex-col gap-2">
                        <label for="productId" class="font-semibold text-surface-900 dark:text-surface-0"> Mahsulot * </label>
                        <p-select
                            id="productId"
                            formControlName="productId"
                            [options]="warehouseService.stocks()"
                            optionLabel="productName"
                            optionValue="productId"
                            placeholder="Mahsulotni tanlang"
                            [filter]="true"
                            filterBy="productName,sku"
                            [fluid]="true"
                        >
                            <ng-template #selectedItem let-selectedOption>
                                @if (selectedOption) {
                                    <div class="flex items-center justify-between w-full">
                                        <span class="font-medium">{{ selectedOption.productName }}</span>
                                        <span class="text-xs text-muted-color">({{ selectedOption.sku }})</span>
                                    </div>
                                }
                            </ng-template>
                            <ng-template #item let-product>
                                <div class="flex items-center justify-between w-full py-1">
                                    <div>
                                        <div class="font-medium">{{ product.productName }}</div>
                                        <div class="text-xs text-muted-color">SKU: {{ product.sku }}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-semibold text-sm">{{ product.currentQuantity }} {{ product.unit }}</div>
                                        @if (product.isLowStock) {
                                            <span class="text-xs text-red-500 font-bold">Tanqislik</span>
                                        }
                                    </div>
                                </div>
                            </ng-template>
                        </p-select>
                        @if (isFieldInvalid('productId')) {
                            <small class="text-red-500 font-medium">Mahsulot tanlanishi shart</small>
                        }
                    </div>

                    <!-- Tanlangan mahsulot qoldig'i haqida axborot kartochkasi -->
                    @if (selectedProduct(); as product) {
                        <div class="p-3 bg-surface-100 dark:bg-surface-800 rounded-lg flex items-center justify-between border border-surface-200 dark:border-surface-700">
                            <div>
                                <span class="text-sm text-muted-color block">Hozirgi ombor qoldig'i:</span>
                                <span class="text-lg font-bold text-surface-900 dark:text-surface-0"> {{ product.currentQuantity }} {{ product.unit }} </span>
                            </div>
                            <div class="text-right">
                                <span class="text-sm text-muted-color block">Minimal chegara:</span>
                                <span class="text-sm font-semibold"> {{ product.minStockLevel }} {{ product.unit }} </span>
                            </div>
                        </div>
                    }

                    <!-- Miqdor va Sabab (2 ustun) -->
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Miqdor -->
                        <div class="flex flex-col gap-2">
                            <label for="quantity" class="font-semibold text-surface-900 dark:text-surface-0"> Miqdori * </label>
                            <p-inputnumber id="quantity" formControlName="quantity" [min]="0.001" placeholder="0.00" [fluid]="true"></p-inputnumber>
                            @if (form.get('quantity')?.hasError('required') && (form.get('quantity')?.dirty || form.get('quantity')?.touched)) {
                                <small class="text-red-500 font-medium">Miqdor kiritilishi shart</small>
                            }
                            @if (form.get('quantity')?.hasError('min')) {
                                <small class="text-red-500 font-medium">Miqdor kamida 0.001 bo'lishi kerak</small>
                            }
                            @if (form.get('quantity')?.hasError('exceedsStock')) {
                                <small class="text-red-500 font-medium"> Ombordagi qoldiqdan ({{ selectedProduct()?.currentQuantity }} {{ selectedProduct()?.unit }}) ko'p chiqim qilib bo'lmaydi! </small>
                            }
                        </div>

                        <!-- Harakat sababi -->
                        <div class="flex flex-col gap-2">
                            <label for="reason" class="font-semibold text-surface-900 dark:text-surface-0"> Sababi * </label>
                            <p-select id="reason" formControlName="reason" [options]="currentReasonOptions()" optionLabel="label" optionValue="value" placeholder="Sababni tanlang" [fluid]="true"></p-select>
                            @if (isFieldInvalid('reason')) {
                                <small class="text-red-500 font-medium">Sabab tanlanishi shart</small>
                            }
                        </div>
                    </div>

                    <!-- Hujjat / Asos raqami -->
                    <div class="flex flex-col gap-2">
                        <label for="referenceId" class="font-semibold text-surface-900 dark:text-surface-0"> Hujjat / Buyurtma raqami (Ixtiyoriy) </label>
                        <input id="referenceId" type="text" pInputText formControlName="referenceId" placeholder="Masalan: INVOICE-0012 yoki ORDER-45" class="w-full" />
                    </div>

                    <!-- Izoh -->
                    <div class="flex flex-col gap-2">
                        <label for="notes" class="font-semibold text-surface-900 dark:text-surface-0"> Izoh (Ixtiyoriy) </label>
                        <textarea id="notes" pTextarea formControlName="notes" rows="2" placeholder="Harakat haqida qo'shimcha ma'lumot..." class="w-full"></textarea>
                    </div>
                </form>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button label="Bekor qilish" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="closeDialog()"></p-button>
                    <p-button label="Saqlash" icon="pi pi-check" [loading]="submitting()" (onClick)="onSubmit()"></p-button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class MovementDialogComponent implements OnInit, OnChanges {
    readonly warehouseService = inject(WarehouseService);
    private readonly fb = inject(FormBuilder);
    private readonly messageService = inject(MessageService);

    @Input() visible = false;
    @Input() preselectedProductId: string | null = null;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() saved = new EventEmitter<void>();

    readonly submitting = signal<boolean>(false);

    readonly typeOptions = [
        { label: 'Kirim (IN)', value: 'IN' },
        { label: 'Chiqim (OUT)', value: 'OUT' }
    ];

    readonly inReasons = [
        { label: 'Yetkazib beruvchidan xarid (PURCHASE)', value: 'PURCHASE' },
        { label: 'Ishlab chiqarishdan kirim (PRODUCTION_IN)', value: 'PRODUCTION_IN' },
        { label: 'Inventarizatsiya / Qayta hisob (ADJUSTMENT)', value: 'ADJUSTMENT' }
    ];

    readonly outReasons = [
        { label: 'Mijozga sotuv (SALE)', value: 'SALE' },
        { label: 'Ishlab chiqarishga sarf (PRODUCTION_OUT)', value: 'PRODUCTION_OUT' },
        { label: 'Hisobdan chiqarish / Yaroqsiz (ADJUSTMENT)', value: 'ADJUSTMENT' }
    ];

    form: FormGroup = this.fb.group({
        productId: ['', [Validators.required]],
        type: ['IN' as StockMovementType, [Validators.required]],
        quantity: [null, [Validators.required, Validators.min(0.001)]],
        reason: ['PURCHASE' as StockMovementReason, [Validators.required]],
        referenceId: [''],
        notes: ['']
    });

    readonly selectedProductId = signal<string>('');
    readonly selectedProduct = computed<StockItem | undefined>(() => {
        const id = this.selectedProductId();
        return this.warehouseService.stocks().find((s) => s.productId === id);
    });

    readonly movementType = signal<StockMovementType>('IN');
    readonly currentReasonOptions = computed(() => {
        return this.movementType() === 'IN' ? this.inReasons : this.outReasons;
    });

    ngOnInit(): void {
        this.setupFormSubscriptions();
        this.setupCustomValidator();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['preselectedProductId'] && this.preselectedProductId) {
            this.form.patchValue({ productId: this.preselectedProductId });
            this.selectedProductId.set(this.preselectedProductId);
        }
        if (changes['visible'] && this.visible) {
            if (this.preselectedProductId) {
                this.form.patchValue({ productId: this.preselectedProductId });
                this.selectedProductId.set(this.preselectedProductId);
            }
        }
    }

    private setupFormSubscriptions(): void {
        this.form.get('productId')?.valueChanges.subscribe((val) => {
            this.selectedProductId.set(val || '');
            this.form.get('quantity')?.updateValueAndValidity();
        });

        this.form.get('type')?.valueChanges.subscribe((type: StockMovementType) => {
            this.movementType.set(type);
            const defaultReason = type === 'IN' ? 'PURCHASE' : 'SALE';
            this.form.patchValue({ reason: defaultReason }, { emitEvent: false });
            this.form.get('quantity')?.updateValueAndValidity();
        });
    }

    private setupCustomValidator(): void {
        const quantityControl = this.form.get('quantity');
        if (quantityControl) {
            quantityControl.addValidators(this.stockAvailabilityValidator());
        }
    }

    private stockAvailabilityValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!this.form) {
                return null;
            }
            const type = this.form.get('type')?.value;
            const productId = this.form.get('productId')?.value;
            const quantity = Number(control.value);

            if (type === 'OUT' && productId && quantity > 0) {
                const product = this.warehouseService.stocks().find((s) => s.productId === productId);
                const availableStock = product?.currentQuantity ?? 0;
                if (quantity > availableStock) {
                    return {
                        exceedsStock: true,
                        availableStock,
                        requestedQuantity: quantity
                    };
                }
            }
            return null;
        };
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.form.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    onVisibleChange(val: boolean): void {
        this.visible = val;
        this.visibleChange.emit(val);
        if (!val) {
            this.resetForm();
        }
    }

    closeDialog(): void {
        this.onVisibleChange(false);
    }

    resetForm(): void {
        this.form.reset({
            productId: this.preselectedProductId || '',
            type: 'IN',
            quantity: null,
            reason: 'PURCHASE',
            referenceId: '',
            notes: ''
        });
        this.movementType.set('IN');
        this.selectedProductId.set(this.preselectedProductId || '');
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Ogohlantirish',
                detail: "Iltimos, barcha maydonlarni to'g'ri to'ldiring."
            });
            return;
        }

        this.submitting.set(true);
        const formValue = this.form.value;
        const dto: CreateMovementDto = {
            productId: formValue.productId,
            type: formValue.type,
            quantity: Number(formValue.quantity),
            reason: formValue.reason,
            referenceId: formValue.referenceId?.trim() || undefined,
            notes: formValue.notes?.trim() || undefined
        };

        this.warehouseService.recordMovement(dto).subscribe({
            next: () => {
                this.submitting.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Muvaffaqiyatli',
                    detail: 'Ombor harakati muvaffaqiyatli qayd etildi.'
                });
                this.saved.emit();
                this.closeDialog();
            },
            error: (err) => {
                this.submitting.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Xatolik',
                    detail: err?.error?.message || 'Harakatni saqlashda xatolik yuz berdi.'
                });
            }
        });
    }
}
