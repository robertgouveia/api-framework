import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../../../utils/logger";
import {readJSON, writeJSON} from "../../../../utils/json";
import DB from "../../../../database/db";
import {BadRequest, MethodNotAllowed} from "../../../../utils/errors";
import bcrypt from "bcrypt";
import {User} from "../../../../entities/user";
import jwt from "jsonwebtoken";

/**
 * Handles the POST HTTP method for authenticating a user using their email and password.
 *
 * @param {IncomingMessage} req - The HTTP request object containing the user's login information.
 * @param {ServerResponse} res - The HTTP response object used to communicate the result of the authentication process.
 * @param {ILogger} logger - The logging interface used for logging error or information messages.
 * @param {DB} db - The database interface used to interact with the user and session tables.
 * @return {Promise<void>} Resolves without a value when the response is successfully sent, or throws an error in case of failure.
 */
export async function POST(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB): Promise<void> {
    if (req.method !== 'POST') throw new MethodNotAllowed();

    const payload = await readJSON<{email: string, password: string}>(req);
    if (!payload.email || !payload.password) throw new BadRequest();

    const result = await db.Client.query('SELECT * FROM "user" WHERE email = $1', [payload.email]);
    const user = result.rows[0] as User;

    if (!user) throw new BadRequest();

    const match = await bcrypt.compare(payload.password, user.password);

    if (match && user.verified) {
        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.JWT_SECRET || "default_secret",
            {expiresIn: "1h"}
        );

        await db.Client.query('BEGIN');
        await db.Client.query('UPDATE "user" SET last_login = now() WHERE email = $1', [payload.email]);
        await db.Client.query('INSERT INTO "session" (session, exp, user_id) VALUES ($1, now() + interval \'1 hour\', $2)', [token, user.id]);
        await db.Client.query('COMMIT');

        writeJSON(res, {token: token, expires_in: Date.now() + 3600000}, 200);
        return
    }

    throw new BadRequest();
}