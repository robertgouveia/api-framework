import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../../utils/logger";
import {BadRequest, MethodNotAllowed} from "../../../utils/errors";
import DB from "../../../database/db";
import getSession from "../../../utils/session";
import {writeJSON} from "../../../utils/json";

/**
 * Handles incoming GET requests, validates the session, and retrieves user data from the database.
 *
 * @param {IncomingMessage} req The incoming HTTP request object.
 * @param {ServerResponse} res The outgoing HTTP response object.
 * @param {ILogger} logger Logger instance used for logging messages and errors.
 * @param {DB} db Database connection instance to execute queries.
 * @throws {MethodNotAllowed} If the HTTP request method is not GET.
 * @throws {BadRequest} If there is no valid session or the user does not exist in the database.
 * @return {Promise<void>} Sends a JSON response containing the user's id, email, and verification status.
 */
export async function GET(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB): Promise<void> {
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