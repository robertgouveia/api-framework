import pg from 'pg';
import * as fs from "node:fs/promises";

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

    public async getMigrations(): Promise< { index: number, sql: string, name: string }[]> {
        if (!await this.pingConnection()) throw new Error('Database connection is not available');

        const files = await fs.readdir(`${__dirname}/migrations`);
        let migrations: { index: number, sql: string, name: string }[] = [];

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
        return migrations;
    }

    public async migrate(direction: 'up' | 'down' = 'up') {
        try {
            let migrations = await this.getMigrations();
            let migrationTable = migrations[0].sql;
            direction === 'up' && await this.Client.query(migrationTable.split('-- up')[1]);

            const result = await this.Client.query('SELECT COUNT(*) FROM migration');
            if (result.rows[0].count === migrations.length) return;

            migrations = migrations.slice(direction === 'up' ? result.rows[0].count : 0, migrations.length);

            for (const migration of migrations) {
                console.log(`Migrating ${direction === 'up' ? 'up' : 'down'} to ${migration.name}`);
                await this.Client.query(migration.sql.split('-- up')[direction === 'up' ? 1 : 0]);
                direction === 'up' && await this.Client.query('INSERT INTO migration (name) VALUES ($1)', [migration.name]);
            }

            if (direction === 'down') await this.Client.query(migrationTable.split('-- up')[0]);
        } catch (err) {
            console.error('Error during migration:', err);
        }
    }
}