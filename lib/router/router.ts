import Group from "./group";
import {ErrorResponse, MethodNotAllowed, NotFound} from "../utils/errors";
import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger, LogLevel} from "../utils/logger";
import DB from "../database/db";
import {writeJSON} from "../utils/json";

/**
 * Router class responsible for managing routes, handling middlewares,
 * and processing HTTP requests in a server environment.
 */
export default class Router {
    public routes: Map<string, Map<string, ((req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void) | (() => void)>> = new Map();
    private globalMiddlewares: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, db: DB, next: () => void) => void | Promise<void>)[] = []
    private readonly logger: ILogger;
    private readonly db: DB;

    constructor(logger: ILogger, db: DB) {
        this.logger = logger;
        this.db = db;
    }

    /**
     * Executes the middleware chain with the provided request and response objects.
     * It processes each middleware in sequence until all middlewares are executed or an error occurs.
     * Calls the final handler when all middlewares are completed.
     *
     * @param {IncomingMessage} req - The HTTP request object.
     * @param {ServerResponse} res - The HTTP response object.
     * @param {number} index - The current middleware index being executed.
     * @param {(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void | Promise<void>} finalHandler - The final handler to call after all middlewares are executed.
     * @return {Promise<void>} A promise that resolves when the middleware chain is completed or an error is handled.
     */
    public async executeMiddleware(req: IncomingMessage, res: ServerResponse, index: number, finalHandler: (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void | Promise<void>): Promise<void> {
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

    /**
     * Adds a new group to the collection.
     *
     * @param {Group} group - The group instance to be added.
     * @return {void} This method does not return a value.
     */
    public addGroup(group: Group): void {
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

    /**
     * Maps incoming requests to their corresponding route handlers and executes middleware.
     *
     * @param {IncomingMessage} req - The HTTP request object.
     * @param {ServerResponse} res - The HTTP response object.
     * @param {((logger: ILogger, req: IncomingMessage, res: ServerResponse, db: DB, next: () => void) => void)[]} [middlewares] - An optional array of global middleware functions to execute before handling the route.
     * @return {Promise<void>} Returns a promise that resolves when middleware execution and route handling are complete.
     * @throws {NotFound} Throws an error if the requested route is not found.
     * @throws {MethodNotAllowed} Throws an error if the HTTP method for the route is not allowed.
     */
    public async mapRoutes(req: IncomingMessage, res: ServerResponse, middlewares?: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, db: DB, next: () => void) => void)[]): Promise<void> {
        middlewares && (this.globalMiddlewares = middlewares);

        const handler = this.routes.get(req.url ?? '/');
        if (!handler) throw new NotFound('Route not found');

        const routeHandler = handler.get(req.method ?? '/') ?? handler.get('GET');
        if (!routeHandler) throw new MethodNotAllowed();
        await this.executeMiddleware(req, res, 0, routeHandler);
    }
}