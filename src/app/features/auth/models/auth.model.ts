export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    companyId: string;
    role: string;
    isSuperAdmin: boolean;
    permissions: string[];
}

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    accessToken: string;
    user: UserProfile;
}
