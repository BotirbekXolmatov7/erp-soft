export type StockMovementType = 'IN' | 'OUT';

export type StockMovementReason = 'PURCHASE' | 'SALE' | 'PRODUCTION_IN' | 'PRODUCTION_OUT' | 'ADJUSTMENT';

export interface StockItem {
    productId: string;
    productName: string;
    sku: string;
    unit: string;
    currentQuantity: number;
    minStockLevel: number;
    isLowStock: boolean;
}

export interface StockMovement {
    id: string;
    productId: string;
    productName: string;
    sku?: string;
    unit?: string;
    quantity: number;
    type: StockMovementType;
    reason: StockMovementReason;
    createdAt: string;
    notes?: string;
    referenceId?: string;
}

export interface CreateMovementDto {
    productId: string;
    type: StockMovementType;
    quantity: number;
    reason: StockMovementReason;
    notes?: string;
    referenceId?: string;
}

export interface StockTransactionResponse {
    data: {
        id: string;
        companyId: string;
        productId: string;
        quantity: number;
        type: StockMovementType;
        reason: StockMovementReason;
        referenceId?: string;
        notes?: string;
        createdAt: string;
        product?: {
            id: string;
            name: string;
            sku: string;
            unit: string;
        };
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
