export interface RegisterUserDTO {
    email: string;
    password: string;
}

export interface VerifyUserDTO {
    email: string;
    code: string;
}

export interface User {
    id: number;
    email: string;
    password: string;
    verified: boolean;
    last_login: Date | null;
}

export interface Verify {
    id: number;
    email: string;
    code: string;
    expires: Date;
}

export interface UserSession {
    id: number;
    email: string;
}