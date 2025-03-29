import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "../../utils/logger";
import DB from "../database/db";

export default class Group {
    private readonly root: string;
    public groups: Group[] = [];
    public routes: Map<string, (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void> = new Map();
    public logger: ILogger;
    public middleware?: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, next: () => void) => void)[] = [];

    constructor(logger: ILogger, root: string, routes: (group: Group) => void, middleware?: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, next: () => void) => void)[]) {
        middleware && (this.middleware = middleware);
        this.logger = logger;
        this.root = root;
        routes(this);
    }

    public addRoute(path: string, handler: (req: IncomingMessage, res: ServerResponse, logger: ILogger, db: DB) => void) {
        this.routes.set(this.root + path, handler);
    }

    public addGroup(logger: ILogger, root: string, routes: (group: Group) => void, middleware?: ((logger: ILogger, req: IncomingMessage, res: ServerResponse, next: () => void) => void)[]): Group {
        const group = new Group(logger, this.root + root, routes, middleware);
        this.groups.push(group);
        return group;
    }
}