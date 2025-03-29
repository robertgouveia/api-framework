import {ServerResponse} from "node:http";

export function writeJSON(res: ServerResponse, data: any, status: number) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = status;

    res.end(JSON.stringify({
        'status': status,
        'data': data,
    }));
}