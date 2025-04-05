import {IncomingMessage, ServerResponse} from "node:http";
import {BadRequest} from "./errors";

/**
 * Sends a JSON response to the client with the specified data and HTTP status code.
 *
 * @param {ServerResponse} res - The server response object used to send the response.
 * @param {any} data - The data to be included in the JSON response body.
 * @param {number} status - The HTTP status code to set for the response.
 * @return {void} This function does not return a value.
 */
export function writeJSON(res: ServerResponse, data: any, status: number): void {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = status;

    res.end(JSON.stringify({
        'status': status,
        'data': data,
    }));
}

/**
 * Reads and parses JSON data from an incoming HTTP request.
 *
 * @param {IncomingMessage} req - The incoming HTTP request object.
 * @return {Promise<T>} A promise that resolves with the parsed JSON data as type T.
 * @throws {BadRequest} Throws an error if the request body is not valid JSON.
 */
export async function readJSON<T>(req: IncomingMessage): Promise<T> {
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