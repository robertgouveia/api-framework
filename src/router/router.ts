import Group from "./group";
import {ErrorResponse, MethodNotAllowed, NotFound} from "../../utils/errors";
import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger, LogLevel} from "../../utils/logger";
import DB from "../../pkg/database/db";
import {writeJSON} from "../../utils/json";

export default class Router {
    public routes: Map<string, Map<string, ((req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void) | (() => void)>> = new Map();
    private globalMiddlewares: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, db: DB, next: () => void) => void | Promise<void>)[] = []
    private readonly logger: ILogger;
    private readonly db: DB;

    constructor(logger: ILogger, db: DB) {
        this.logger = logger;
        this.db = db;
    }

    public async executeMiddleware(req: IncomingMessage, res: ServerResponse, index: number, finalHandler: (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void | Promise<void>) {
        try {
            if (index >= this.globalMiddlewares.length) {
                await finalHandler(req, res, this.logger, this.db);
                return;
            }

            const middleware = this.globalMiddlewares[index];
            const next = async () => {
                await this.executeMiddleware(req, res, index + 1, finalHandler);
            };

            await middleware(this.logger, req, res, this.db, next);
        } catch (error: any) {
            this.logger.log('Caught Error: ' + error.message, LogLevel.ERROR);

            if (error instanceof ErrorResponse) {
                res.statusCode = error.statusCode;
                writeJSON(res, {
                    'message': error.message,
                }, error.statusCode)
                return;
            }

            res.statusCode = 500;
            writeJSON(res, {
                'message': 'Internal Server Error',
            }, 500)
        }
    }

    public addGroup(group: Group) {
        this.addGroups(group);
    }

    public addGroups(...groups: Group[]) {
        groups.forEach((group) => {
            if (group.groups.length > 0) {
                this.addGroups(...group.groups);
            }

            group.routes.forEach((handler, path) => {
                this.routes.set(path, handler);
            })
        })
    }

    public async mapRoutes(req: IncomingMessage, res: ServerResponse, middlewares?: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, db: DB, next: () => void) => void)[]) {
        middlewares && (this.globalMiddlewares = middlewares);

        const handler = this.routes.get(req.url ?? '/');
        if (!handler) throw new NotFound('Route not found');

        const routeHandler = handler.get(req.method ?? '/') ?? handler.get('GET');
        if (!routeHandler) throw new MethodNotAllowed();
        await this.executeMiddleware(req, res, 0, routeHandler);
    }
}