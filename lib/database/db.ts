import pg from 'pg';
import * as fs from "node:fs/promises";

/**
 * The DB class provides methods to connect, disconnect, perform database migrations, and check database connectivity.
 */
export default class DB {
    public Client: pg.Client;

    constructor(user?: string, password?: string, database?: string, host?: string, port?: number) {
        this.Client = new pg.Client({
            user: user ?? 'postgres',
            host: host ?? 'localhost',
            database: database ?? 'typescript',
            password: password ?? 'postgres',
            port: port ?? 5432,
            query_timeout: 3000,
        });
    }

    /**
     * Establishes a connection using the Client instance.
     *
     * @return {Promise<string | null>} A promise that resolves to null if the connection is successful,
     * or a string representing the error code if the connection fails.
     */
    public async connect(): Promise<string | null> {
        await this.Client.connect();
        return null;
    }

    /**
     * Terminates the connection with the client.
     * It ensures that the connection is properly closed to release resources.
     *
     * @return {Promise<void>} A promise that resolves once the disconnect process is complete.
     */
    public async disconnect(): Promise<void> {
        await this.Client.end();
    }

    /**
     * Method to check the connectivity status of the database.
     * Executes a simple query to validate the connection.
     *
     * @return {Promise<boolean>} Resolves to true if the database connection is active and returns rows, otherwise false.
     */
    public async pingConnection(): Promise<boolean> {
        const resp = await this.Client.query('SELECT NOW()');
        return resp.rows.length > 0;
    }

    /**
     * Retrieves and parses SQL migration files from the migrations directory.
     * Each migration file is expected to have a filename formatted as "<index>_<name>.sql".
     *
     * @return {Promise<{ index: number, sql: string, name: string }[]>} A promise that resolves to an array of migration objects.
     * Each object contains the migration index, SQL content, and the name derived from the filename.
     * The array is sorted in ascending order by the index property.
     * @throws {Error} If the database connection is not available.
     */
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

    /**
     * Executes database migrations in the specified direction.
     * Handles applying or reverting migrations by either running the SQL "up" instructions
     * for applying migrations or the "down" instructions for reverting migrations.
     *
     * @param {'up'|'down'} [direction='up'] The direction of the migration. 'up' applies migrations and 'down' reverts migrations.
     * @return {Promise<void>} A promise that resolves when the migration process completes.
     */
    public async migrate(direction: 'up' | 'down' = 'up') {
        try {
            let migrations = await this.getMigrations();
            if (direction === 'down') migrations = migrations.reverse();

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