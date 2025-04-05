/**
 * Represents the data transfer object for registering a new user.
 * Contains essential properties required for creating a new user account.
 */
export interface RegisterUserDTO {
    email: string;
    password: string;
}

/**
 * Represents a user in the system.
 *
 * @interface User
 * @property {number} id - The unique identifier for the user.
 * @property {string} email - The email address associated with the user.
 * @property {string} password - The hashed password for the user.
 * @property {boolean} verified - Indicates whether the user's email has been verified.
 * @property {(Date | null)} last_login - The timestamp of the user's last login, or null if the user has never logged in.
 */
export interface User {
    id: number;
    email: string;
    password: string;
    verified: boolean;
    last_login: Date | null;
}

/**
 * Represents a verification entity with essential details for validation.
 *
 * @interface Verify
 * @property {number} id - A unique identifier for the verification record.
 * @property {string} email - The email address associated with the verification process.
 * @property {string} code - The verification code used for validation.
 * @property {Date} expires - The expiration date and time of the verification code.
 */
export interface Verify {
    id: number;
    email: string;
    code: string;
    expires: Date;
}