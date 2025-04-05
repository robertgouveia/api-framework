import * as http from 'http';
import {ConsoleLogger, ILogger, LogLevel} from "../utils/logger";
import Router from "../router/router";
import loggerMiddleware from "../router/middleware/loggingMiddleware";
import DB from "../database/db";
import {writeJSON} from "../utils/json";
import {ErrorResponse} from "../utils/errors";
import Group from "../router/group";

import healthRoutes from "../router/routes/health/routes";
import registerRoute from "../router/routes/auth/register/routes";
import verifyRoutes from "../router/routes/auth/verify/routes";
import loginRoute from "../router/routes/auth/login/routes";
import userRoute from "../router/routes/user/routes";
import protectedMiddleware from "../router/middleware/protectedMiddleware";
import AddRoutes from "../../src/routes";

/**
 * Represents a Server class responsible for handling HTTP requests, managing routes, and interacting with a database.
 */
export default class Server {
    private readonly port: number = 3000;
    private server: http.Server | null = null;
    private readonly logger: ILogger = new ConsoleLogger();
    public readonly router: Router;
    private readonly db: DB;

    constructor(client: DB, port?: number, logger?: ILogger) {
        logger && (this.logger = logger);
        port && (this.port = port);
        this.db = client;
        this.router = new Router(this.logger, this.db);
        this.addRoutes();
    }

    /**
     * Configures and adds route groups to the application router.
     *
     * This method organizes API endpoints into groups with appropriate logging, database connections,
     * and middleware. It includes both public and protected routes for different API functionalities.
     *
     * @return {void} Does not return a value.
     */
    private addRoutes(): void {
        this.router.addGroup(new Group(this.db, this.logger, '/api/v1', (group: Group) => {
            healthRoutes(group);

            group.addGroup(this.db, this.logger, '/auth', (group: Group) => {
                registerRoute(group);
                loginRoute(group);
                verifyRoutes(group);
            });
        }));

        this.router.addGroup(new Group(this.db, this.logger, '/api/v1', (group: Group) => {
            userRoute(group);
        }, [protectedMiddleware]))

        AddRoutes(this.router);
    }

    /**
     * Starts the server by initiating the listening process on the configured port.
     * Logs an error if the server is not initialized and logs an informational message when the server starts running.
     * Also begins shutdown listening for server termination handling.
     *
     * @return {void} Does not return any value.
     */
    public start(): void {
        this.logger.log(`Server running on port ${this.port}`, LogLevel.INFO);
        this.server = http.createServer(async (req, res) => {
            try {
                await this.router.mapRoutes(req, res, [loggerMiddleware]);
            } catch (error: any) {
                if (error instanceof ErrorResponse) {
                    res.statusCode = error.statusCode;
                    writeJSON(res, {
                        'message': error.message,
                    }, error.statusCode)
                    return;
                }

                this.logger.log(`Unhandled error in request: ${error.message}`, LogLevel.ERROR);
                if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            }
        });
        
        this.server?.listen(this.port);
        this.listenShutdown();
    }

    /**
     * Sets up listeners for shutdown signals and handles necessary cleanup before shutting down the server.
     * The method listens for various system signals (e.g., SIGINT, SIGTERM, etc.) and uncaught exceptions or unhandled promise rejections.
     *
     * @return {void} This method does not return a value.
     */
    private listenShutdown(): void {
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