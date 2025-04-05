import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger, LogLevel} from "../utils/logger";
import DB from "../database/db";
import {ErrorResponse} from "../utils/errors";
import {writeJSON} from "../utils/json";

/**
 * Represents a route group that encapsulates route definitions, middleware, and sub-groups.
 * Provides methods to add routes and nested groups, and to execute associated middleware.
 */
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
        this.logger = logger;
        this.root = root;
        routes(this);
    }

    /**
     * Executes a series of middleware functions in sequence. If all middleware functions are executed successfully, the final handler is invoked.
     *
     * @param {IncomingMessage} req - The incoming HTTP request object.
     * @param {ServerResponse} res - The server response object.
     * @param {number} index - The current index of the middleware being executed in the middleware array.
     * @param {(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void | Promise<void>} finalHandler - The final handler function to execute after all middleware has been processed.
     * @return {Promise<void>} A promise that resolves when all middleware and the final handler (if applicable) are executed successfully. If an error is caught during execution, the promise rejects or sends an error response.
     */
    public async executeMiddleware(req: IncomingMessage, res: ServerResponse, index: number, finalHandler: (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void | Promise<void>): Promise<void> {
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

    /**
     * Registers a new route with a specified path and handler within the routing system.
     *
     * @param {string} path - The relative path for the route. If "/" is given, it maps to the root path.
     * @param {(req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void | Promise<void>} handler - The function to handle incoming requests for the specified path.
     * @return {void} This method does not return a value.
     */
    public addRoute(path: string, handler: (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void | Promise<void>): void {
        const fullPath = this.root + (path === '/' ? '' : path);

        if (!this.routes.has(fullPath)) {
            this.routes.set(fullPath, new Map());
        }

        const route = this.routes.get(fullPath);
        route?.set(handler.name, (req: IncomingMessage, res: ServerResponse) => this.executeMiddleware(req, res, 0, handler));
    }

    /**
     * Adds a group to the current application with the specified parameters.
     *
     * @param {DB} db - The database instance to associate with the group.
     * @param {ILogger} logger - The logger instance used by the group for logging.
     * @param {string} root - The root path for the group.
     * @param {(group: Group) => void} routes - A callback function to define routes belonging to the group.
     * @param {Array<((logger: ILogger, req: IncomingMessage, res: ServerResponse, db: DB, next: (req: IncomingMessage, res: ServerResponse) => void) => Promise<void> | void)>} [middleware] - An optional array of middleware functions to be applied to the group.
     * @return {Group} The newly created group instance.
     */
    public addGroup(db: DB, logger: ILogger, root: string, routes: (group: Group) => void, middleware?: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, db: DB, next: (req: IncomingMessage, res: ServerResponse) => void) => Promise<void> | void)[]): Group {
        const group = new Group(db, logger, this.root + root, routes, middleware);
        this.groups.push(group);
        return group;
    }
}