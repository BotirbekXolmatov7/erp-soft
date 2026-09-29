export type ProductUnit = 'DONA' | 'KG' | 'METR';
export type ProductType = 'RAW_MATERIAL' | 'FINISHED_GOOD';

export interface Product {
    id: string;
    name: string;
    sku: string;
    unit: ProductUnit;
    type: ProductType;
    minStockLevel: number;
    currentStock: number;
    price: number;
    companyId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductDto {
    name: string;
    sku: string;
    unit: ProductUnit;
    type: ProductType;
    minStockLevel: number;
    currentStock?: number;
    price: number;
}
