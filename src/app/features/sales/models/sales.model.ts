export type SalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface SalesOrderItem {
    id?: string;
    orderId?: string;
    productId: string;
    productName?: string;
    sku?: string;
    unit?: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
    product?: {
        id: string;
        name: string;
        sku: string;
        unit: string;
    };
}

export interface SalesOrder {
    id: string;
    orderNumber?: string;
    customerName: string;
    totalAmount: number;
    status: SalesOrderStatus;
    items: SalesOrderItem[];
    companyId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateSalesOrderItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateSalesOrderDto {
    customerName: string;
    items: CreateSalesOrderItemDto[];
}
