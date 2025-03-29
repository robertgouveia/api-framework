import pg from 'pg';

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
}