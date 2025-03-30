import {IncomingMessage, ServerResponse} from "node:http";
import {BadRequest} from "./errors";

export function writeJSON(res: ServerResponse, data: any, status: number) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = status;

    res.end(JSON.stringify({
        'status': status,
        'data': data,
    }));
}

export async function readJSON<T>(req: IncomingMessage) {
    const buffers: Buffer[] = [];

    for await (const chunk of req) {
        buffers.push(chunk);
    }

    let body;
    try {
        body = JSON.parse(Buffer.concat(buffers).toString());
    } catch (e) {
        throw new BadRequest();
    }

    return body as T;
}