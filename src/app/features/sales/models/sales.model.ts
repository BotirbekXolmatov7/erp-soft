export interface SaleOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    companyId: string;
    createdAt: string;
}
