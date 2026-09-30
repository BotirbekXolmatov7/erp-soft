export interface RoleOption {
    id: number;
    name: string;
    code: string;
}

export interface CompanyUser {
    id: string;
    fullName: string;
    email: string;
    companyId?: string;
    role: RoleOption | null;
    isActive: boolean;
    isSuperAdmin?: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateCompanyUserDto {
    fullName: string;
    email: string;
    password: string;
    roleId: number;
}

export interface UsersResponse {
    data: CompanyUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
