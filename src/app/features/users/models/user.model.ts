export interface SystemUser {
    id: string;
    fullName: string;
    email: string;
    companyId: string;
    role: string;
    status: 'ACTIVE' | 'INACTIVE';
    permissions: string[];
    createdAt: string;
}
