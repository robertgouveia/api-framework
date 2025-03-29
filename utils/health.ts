import DB from "../pkg/database/db";

// TODO: fix retry logic for runtime
export async function CheckDB(db: DB) {
    const retries = 3;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const resp = await db.Client.query('SELECT NOW()');
            return resp.rows.length > 0;
        } catch (e) {
            if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                await db.connect();
            }
        }
    }
    return false;
}