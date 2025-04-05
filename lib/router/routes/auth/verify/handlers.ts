import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../../../utils/logger";
import {readJSON, writeJSON} from "../../../../utils/json";
import DB from "../../../../database/db";
import {BadRequest, MethodNotAllowed} from "../../../../utils/errors";
import {User, Verify} from "../../../../entities/user";

/**
 * Handles HTTP PUT requests for user verification and registration.
 *
 * This method verifies a user by checking the provided code against a stored code
 * in the database. If the code is invalid or does not match, the verification entry
 * is reset with a new code. If the code is valid, the user is marked as verified.
 *
 * @param {IncomingMessage} req - The incoming HTTP request object.
 * @param {ServerResponse} res - The outgoing HTTP response object.
 * @param {ILogger} logger - Logger instance used for logging information.
 * @param {DB} db - Database instance used to query and update user and verification data.
 * @return {Promise<void>} A promise that resolves when the operation is completed.
 * @throws {MethodNotAllowed} Thrown if the HTTP method is not PUT.
 * @throws {BadRequest} Thrown if the user does not exist or the code is incorrect.
 */
export async function PUT(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB): Promise<void> {
    if (req.method !== 'PUT') throw new MethodNotAllowed();

    const payload = await readJSON<{email: string, password: string, code: string}>(req);

    let result = await db.Client.query('SELECT * FROM "user" WHERE email = $1', [payload.email]);
    const user = result.rows[0] as User;
    result = await db.Client.query('SELECT * FROM "verification" WHERE email = $1', [payload.email]);
    const verify = result.rows[0] as Verify;

    console.log(payload, verify);
    if (!user || verify.code !== payload.code) {
        await db.Client.query('BEGIN');
        await db.Client.query('DELETE FROM "verification" WHERE email = $1', [payload.email]);
        await db.Client.query('INSERT INTO "verification" (email, code) VALUES ($1, $2)', [payload.email, Math.floor(100000 + Math.random() * 900000)])
        await db.Client.query('COMMIT');
        throw new BadRequest();
    }

    await db.Client.query('BEGIN');
    await db.Client.query('DELETE FROM "verification" WHERE email = $1', [payload.email]);
    await db.Client.query('UPDATE "user" SET verified = true WHERE email = $1', [payload.email]);
    await db.Client.query('COMMIT');

    writeJSON(res, {message: "registered"}, 200);
}