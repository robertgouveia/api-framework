import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../../../utils/logger";
import {readJSON, writeJSON} from "../../../../utils/json";
import DB from "../../../../pkg/database/db";
import {BadRequest, MethodNotAllowed} from "../../../../utils/errors";
import {User} from "../../../entities/user";

export async function PUT(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) {
    if (req.method !== 'PUT') throw new MethodNotAllowed();

    const payload = await readJSON<{email: string, password: string, code: number}>(req);

    const result = await db.Client.query('SELECT * FROM "user" WHERE email = $1', [payload.email]);
    const user = result.rows[0] as User;
    if (!user || user.code !== payload.code) {
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