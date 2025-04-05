import * as http from 'http';
import {ConsoleLogger, ILogger, LogLevel} from "../../utils/logger";
import Router from "../router/router";
import Group from "../router/group";
import loggerMiddleware from "../middleware/loggingMiddleware";
import healthRoutes from "../routes/health/routes";
import registerRoute from "../routes/auth/register/routes";
import verifyRoutes from "../routes/auth/verify/routes";
import loginRoute from "../routes/auth/login/routes";
import userRoute from "../routes/user/routes";
import DB from "../../pkg/database/db";
import {writeJSON} from "../../utils/json";
import {ErrorResponse} from "../../utils/errors";
import protectedMiddleware from "../middleware/protectedMiddleware";

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

        // unprotected
        this.router.addGroup(new Group(this.db, this.logger, '/api/v1', (group: Group) => {
            healthRoutes(group);

            group.addGroup(this.db, this.logger, '/auth', (group: Group) => {
                registerRoute(group);
                loginRoute(group);
                verifyRoutes(group);
            });
        }));

        // protected
        this.router.addGroup(new Group(this.db, this.logger, '/api/v1', (group: Group) => {
            userRoute(group);
        }, [protectedMiddleware]))

        console.log(this.router.routes);

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