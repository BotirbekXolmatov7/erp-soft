export type ProductionOrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface BomItem {
    id?: string;
    bomId?: string;
    rawMaterialId: string;
    rawMaterialName?: string;
    quantityRequired: number;
    unit?: string;
    rawMaterial?: {
        id: string;
        name: string;
        sku: string;
        unit: string;
    };
}

export interface Bom {
    id: string;
    name: string;
    finishedProductId: string;
    finishedProductName?: string;
    companyId?: string;
    createdAt?: string;
    finishedProduct?: {
        id: string;
        name: string;
        sku: string;
        unit: string;
    };
    items: BomItem[];
}

export interface CreateBomItemDto {
    rawMaterialId: string;
    quantityRequired: number;
}

export interface CreateBomDto {
    name: string;
    finishedProductId: string;
    items: CreateBomItemDto[];
}

export interface ProductionOrder {
    id: string;
    finishedProductId: string;
    finishedProductName?: string;
    quantityToProduce: number;
    status: ProductionOrderStatus;
    companyId?: string;
    createdAt: string;
    updatedAt?: string;
    finishedProduct?: {
        id: string;
        name: string;
        sku: string;
        unit: string;
    };
}

export interface CreateProductionOrderDto {
    finishedProductId: string;
    quantityToProduce: number;
}
