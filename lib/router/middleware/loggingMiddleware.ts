import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../utils/logger";
import DB from "../../database/db";

/**
 * Middleware function to log incoming HTTP requests and proceed to the next middleware handler.
 *
 * @param {ILogger} logger - The logger instance used to log request details.
 * @param {IncomingMessage} req - The HTTP request object.
 * @param {ServerResponse} res - The HTTP response object.
 * @param {DB} db - The database instance, if needed for future middleware or logging.
 * @param {function} next - The callback function to invoke the next middleware in the pipeline.
 * @return {void} This function does not return a value.
 */
export default function loggerMiddleware(
    logger: ILogger,
    req: IncomingMessage,
    res: ServerResponse,
    db: DB,
    next: (req: IncomingMessage, res: ServerResponse) => void
): void {
    logger.log('HIT ' + req.method + ' ' + req.url);
    next(req, res);
}