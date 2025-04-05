import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger, LogLevel} from "../../utils/logger";
import DB from "../../pkg/database/db";
import {ErrorResponse} from "../../utils/errors";
import {writeJSON} from "../../utils/json";

export default class Group {
    private readonly root: string;
    public groups: Group[] = [];
    public routes: Map<string, Map<string, (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void | Promise<void>>> = new Map();
    public logger: ILogger;
    public middleware?: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, db: DB, next: (req: IncomingMessage, res: ServerResponse) => void) => Promise<void> | void)[] = [];
    public db: DB;

    constructor(db: DB, logger: ILogger, root: string, routes: (group: Group) => void, middleware?: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, db: DB, next: (req: IncomingMessage, res: ServerResponse) => void) => Promise<void> | void)[]) {
        middleware && (this.middleware = middleware);
        this.db = db;
        console.log(this.middleware);
        this.logger = logger;
        this.root = root;
        routes(this);
    }

    public async executeMiddleware(req: IncomingMessage, res: ServerResponse, index: number, finalHandler: (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void | Promise<void>) {
        try {
            if (!this.middleware || index >= this.middleware.length) {
                await finalHandler(req, res, this.logger, this.db);
                return;
            }

            const middleware = this.middleware[index];
            const next = async () => {
                await this.executeMiddleware(req, res, index + 1, finalHandler);
            };

            await middleware(this.logger, req, res, this.db, next);
        } catch (error: any) {
            this.logger.log('Caught Error: ' + error.message, LogLevel.ERROR);

            writeJSON(res, {
                'message': error.message ?? 'Internal Server Error',
            }, error.statusCode ?? 500);
            return;
        }
    }

    public addRoute(path: string, handler: (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void | Promise<void>) {
        const fullPath = this.root + (path === '/' ? '' : path);

        if (!this.routes.has(fullPath)) {
            this.routes.set(fullPath, new Map());
        }

        const route = this.routes.get(fullPath);
        route?.set(handler.name, (req: IncomingMessage, res: ServerResponse) => this.executeMiddleware(req, res, 0, handler));
    }

    public addGroup(db: DB, logger: ILogger, root: string, routes: (group: Group) => void, middleware?: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, db: DB, next: (req: IncomingMessage, res: ServerResponse) => void) => Promise<void> | void)[]): Group {
        const group = new Group(db, logger, this.root + root, routes, middleware);
        this.groups.push(group);
        return group;
    }
}