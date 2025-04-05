import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../../utils/logger";
import {writeJSON} from "../../../utils/json";
import DB from "../../../database/db";
import {MethodNotAllowed} from "../../../utils/errors";

/**
 * Handles incoming GET requests, verifies the request method, checks database connectivity,
 * and sends a JSON response with the database connection status.
 *
 * @param {IncomingMessage} req The incoming HTTP request object.
 * @param {ServerResponse} res The HTTP response object to send the response.
 * @param {ILogger} logger The logger instance for logging operations.
 * @param {DB} db The database instance to check the connection status.
 * @return {Promise<void>} Resolves a promise once the response has been sent.
 * @throws {MethodNotAllowed} Thrown if the request method is not GET.
 */
export async function GET(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB): Promise<void> {
    if (req.method !== 'GET') throw new MethodNotAllowed();

    let database = await db.pingConnection();

    writeJSON(res, { status: {
            database: database,
        }
    }, 200);
}