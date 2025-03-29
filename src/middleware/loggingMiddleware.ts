import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../utils/logger";

export default function loggerMiddleware(
    logger: ILogger,
    req: IncomingMessage,
    res: ServerResponse,
    next: (req: IncomingMessage, res: ServerResponse) => void
): void {
    logger.log('HIT ' + req.url);
    next(req, res);
}