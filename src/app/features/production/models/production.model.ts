export interface ProductionOrder {
    id: string;
    orderCode: string;
    productId: string;
    plannedQuantity: number;
    completedQuantity: number;
    status: 'PLANNED' | 'IN_PROGRESS' | 'DONE';
    companyId: string;
}
