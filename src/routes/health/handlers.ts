import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../../utils/logger";
import {writeJSON} from "../../../utils/json";
import DB from "../../../pkg/database/db";
import {MethodNotAllowed} from "../../../utils/errors";

export async function GET(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) {
    if (req.method !== 'GET') throw new MethodNotAllowed();

    let database = await db.pingConnection();

    writeJSON(res, { status: {
            database: database,
        }
    }, 200);
}