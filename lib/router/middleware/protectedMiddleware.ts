import {ILogger} from "../../utils/logger";
import {IncomingMessage, ServerResponse} from "node:http";
import {BadRequest} from "../../utils/errors";
import DB from "../../database/db";
import jwt from "jsonwebtoken";

/**
 * Middleware function that verifies and processes an authorization token provided in the HTTP request headers.
 *
 * @param {ILogger} logger - The logger instance for logging messages and errors.
 * @param {IncomingMessage} req - The HTTP request object, which may contain the authorization token in the header.
 * @param {ServerResponse} res - The HTTP response object.
 * @param {DB} db - The database instance used for querying session information.
 * @param {function(IncomingMessage, ServerResponse): void} next - The callback function to invoke the next middleware or request handler.
 * @return {Promise<void>} A promise that resolves when the middleware completes processing or rejects if an error occurs.
 * @throws {BadRequest} Throws a BadRequest error if the authorization header is missing, invalid, or the token is expired.
 */
export default async function protectedMiddleware(
    logger: ILogger,
    req: IncomingMessage,
    res: ServerResponse,
    db: DB,
    next: (req: IncomingMessage, res: ServerResponse) => void
): Promise<void> {
    if (!req.headers.authorization?.includes('Bearer ')) throw new BadRequest();

    const token = req.headers.authorization.split('Bearer ')[1];

    const result = await db.Client.query("SELECT * FROM session WHERE session = $1 AND exp >= NOW()", [token]);

    if (result.rowCount === 0) throw new BadRequest();

    // @ts-ignore
    req.session = jwt.decode(token);

    next(req, res);
}