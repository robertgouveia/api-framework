import {ILogger} from "../../utils/logger";
import {IncomingMessage, ServerResponse} from "node:http";
import {BadRequest} from "../../utils/errors";
import DB from "../../pkg/database/db";
import jwt from "jsonwebtoken";

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