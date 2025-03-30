import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../../../utils/logger";
import {readJSON, writeJSON} from "../../../../utils/json";
import DB from "../../../../pkg/database/db";
import {BadRequest, MethodNotAllowed} from "../../../../utils/errors";
import {RegisterUserDTO, User} from "../../../entities/user";
import bcrypt from "bcrypt";

export async function POST(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) {
    if (req.method !== 'POST') throw new MethodNotAllowed();

    const payload = await readJSON<{ email: string, password: string }>(req) as RegisterUserDTO;

    const result = await db.Client.query('SELECT * FROM "user" WHERE email = $1', [payload.email]);
    const user = result.rows[0] as User;
    if (user) throw new BadRequest();

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    if (!payload.email || !payload.password) throw new MethodNotAllowed();

    const code = Math.floor(100000 + Math.random() * 900000);

    await db.Client.query('BEGIN');
    await db.Client.query('INSERT INTO "user" (email, password) VALUES ($1, $2)', [payload.email, hashedPassword]);
    await db.Client.query('INSERT INTO "verification" (email, code) VALUES ($1, $2)', [payload.email, code]);
    await db.Client.query('COMMIT');

    writeJSON(res, {message: "registered"}, 200);
}