import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../utils/logger";
import DB from "../../pkg/database/db";

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