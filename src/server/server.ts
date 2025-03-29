import * as http from 'http';
import {ConsoleLogger, ILogger, LogLevel} from "../../utils/logger";
import Router from "../../pkg/router/router";
import Group from "../../pkg/router/group";
import loggerMiddleware from "../middleware/loggingMiddleware";
import healthRoutes from "../routes/health/routes";
import DB from "../../pkg/database/db";

export default class Server {
    private readonly port: number = 3000;
    private readonly server: http.Server | null = null;
    private readonly logger: ILogger = new ConsoleLogger();
    private readonly router: Router;
    private readonly db: DB;

    constructor(client: DB, port?: number, logger?: ILogger) {
        logger && (this.logger = logger);
        port && (this.port = port);

        this.db = client;
        this.router = new Router(this.logger, this.db);

        this.server = http.createServer((req, res) => {
            this.router.addGroup(new Group(this.logger, '/api/v1', (group: Group) => {
                healthRoutes(group, this.db);
            }));

            this.router.mapRoutes(req, res, [loggerMiddleware]);
        })
    }

    public start() {
        if (!this.server) this.logger.log('Server not initialized', LogLevel.ERROR);
        this.logger.log(`Server running on port ${this.port}`, LogLevel.INFO);
        
        this.server?.listen(this.port);
        this.listenShutdown();
    }

    private listenShutdown() {
        const shutdown = async (signal: string) => {
            await this.db.disconnect();
            this.logger.log(`Received ${signal} signal`, LogLevel.INFO);
            this.server ? this.server.close() : process.exit(0);
        }

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGQUIT', () => shutdown('SIGQUIT'));
        process.on('uncaughtException', () => shutdown('uncaughtException'));
        process.on('unhandledRejection', () => shutdown('unhandledRejection'));
    }
}