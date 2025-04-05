import {IncomingMessage} from "node:http";

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