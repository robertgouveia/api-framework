import Group from "./group";
import {NotFound} from "../../utils/errors";
import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../utils/logger";
import DB from "../database/db";

export default class Router {
    public routes: Map<string, (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void> = new Map();
    private globalMiddlewares: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, next: () => void) => void)[] = []
    private readonly logger: ILogger;
    private readonly db: DB;

    constructor(logger: ILogger, db: DB) {
        this.logger = logger;
        this.db = db;
    }

    public executeMiddleware(req: IncomingMessage, res: ServerResponse, index: number, finalHandler: (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void) {
        if (index >= this.globalMiddlewares.length) return finalHandler(req, res, this.logger, this.db);

        const middleware = this.globalMiddlewares[index];
        const next = () => this.executeMiddleware(req, res, index + 1, finalHandler);

        middleware(this.logger, req, res, next);
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

    public mapRoutes(req: IncomingMessage, res: ServerResponse, middlewares?: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, next: () => void) => void)[]) {
        middlewares && (this.globalMiddlewares = middlewares);

        const handler = this.routes.get(req.url ?? '/');
        if (!handler) return new NotFound(req.url ?? '/');

        this.executeMiddleware(req, res, 0, handler);
    }
}