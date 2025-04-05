import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../../utils/logger";
import {BadRequest, MethodNotAllowed} from "../../../utils/errors";
import DB from "../../../pkg/database/db";
import getSession from "../../../utils/session";
import {writeJSON} from "../../../utils/json";

export async function GET(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) {
    if (req.method !== 'GET') throw new MethodNotAllowed();
    const session = getSession(req);
    if (!session) throw new BadRequest();

    const result = await db.Client.query('SELECT * FROM "user" WHERE id = $1', [session.id]);

    if (result.rowCount === 0) throw new BadRequest();

    writeJSON(res, {
        id: result.rows[0].id,
        email: result.rows[0].email,
        verified: result.rows[0].verified,
    }, 200);
    return;
}