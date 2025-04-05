import {IncomingMessage} from "node:http";

/**
 * Retrieves the session details from the provided request object.
 *
 * @param {IncomingMessage} req - The HTTP request object containing session information.
 * @return {null|{id: number, email: string, exp: number, iat: number}} Returns the session object with user details if available, otherwise null.
 */
export default function getSession(req: IncomingMessage): null | {
    id: number;
    email: string;
    exp: number;
    iat: number;
} {
    // @ts-ignore
    if (!req.session) return null;

    // @ts-ignore
    return req.session as {
        id: number;
        email: string;
        exp: number;
        iat: number;
    }
}