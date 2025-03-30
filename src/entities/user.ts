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
    code: number;
}