import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../../utils/logger";
import {writeJSON} from "../../../utils/json";
import DB from "../../../pkg/database/db";

export async function GET(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) {
    let database = await db.pingConnection();

    writeJSON(res, { status: {
            database: database,
        }
    }, 200);
}