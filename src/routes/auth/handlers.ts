import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../../utils/logger";
import {writeJSON} from "../../../utils/json";
import DB from "../../../pkg/database/db";
import {MethodNotAllowed} from "../../../utils/errors";

export async function POST(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) {
    if (req.method !== 'POST') throw new MethodNotAllowed();

    writeJSON(res, { message: "registered" }, 200);
}