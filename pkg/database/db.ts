import pg from 'pg';
import * as fs from "node:fs/promises"; // Use promises version of fs

// TODO: make runtime compliant
export default class DB {
    public Client: pg.Client;

    constructor() {
        this.Client = new pg.Client({
            user: 'postgres',
            host: 'localhost',
            database: 'typescript',
            password: 'postgres',
            port: 5432,
            query_timeout: 3000,
        });
    }

    public async connect(): Promise<string | null> {
        try {
            await this.Client.connect();
            return null;
        } catch (e: any) {
            return e.code;
        }
    }

    public async disconnect() {
        await this.Client.end();
    }

    public async pingConnection() {
        const resp = await this.Client.query('SELECT NOW()');
        return resp.rows.length > 0;
    }

    public async migrate() {
        if (!await this.pingConnection()) throw new Error('Database connection is not available');

        try {
            const files = await fs.readdir(`${__dirname}/migrations`);
            const migrations: { index: number, sql: string, name: string }[] = [];

            for (const file of files) {
                const parts = file.split('_');
                const index = parseInt(parts[0], 10);
                const ext = file.split('.').pop();
                const name = parts.slice(1, parts.length).join(' ').split('.')[0];
                if (ext !== 'sql') continue;

                const sql = await fs.readFile(`${__dirname}/migrations/${file}`, 'utf8');
                migrations.push({index, sql, name});
            }

            migrations.sort((a, b) => a.index - b.index);

            for (const migration of migrations) {
                await this.Client.query('INSERT INTO migration (name) VALUES ($1)', [migration.name]);
                await this.Client.query(migration.sql);
            }
        } catch (err) {
            console.error('Error during migration:', err);
        }
    }
}