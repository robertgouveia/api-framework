import {ServerResponse} from "node:http";

export interface IErrorResponse {
    statusCode: number;
    message: string;
}

export class ErrorResponse extends Error {
    public statusCode: number;
    public message: string;

    constructor(message: string, statusCode: number) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
    }

    public WriteResponse(res: ServerResponse) {
        res.statusCode = this.statusCode;
        res.end(JSON.stringify(this));
    }
}

export class InternalServerError extends ErrorResponse implements IErrorResponse {
    constructor() { super('Internal Server Error', 500) }
}

export class NotFound extends ErrorResponse implements IErrorResponse {
    constructor(path: string) { super('Not Found ' + path, 404) }
}

export class BadRequest extends ErrorResponse implements IErrorResponse {
    constructor() { super('Bad Request', 400) }
}

export class MethodNotAllowed extends ErrorResponse implements IErrorResponse {
    constructor() { super('Method Not Allowed', 405) }
}