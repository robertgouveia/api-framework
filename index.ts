import parseFlags from "./utils/parseFlags";
import Server from './src/server/server';
import {LogLevel, TextLogger} from "./utils/logger";
import * as process from "process";
import * as fs from "fs";
import DB from "./pkg/database/db";

const start = async () => {
    fs.mkdirSync(`${__dirname}/logs`, {recursive: true})
    const logger = new TextLogger(`${__dirname}/logs/log.txt`);

    const db = new DB();
    const err = await db.connect();

    if (err) await logger.log('Database ' + err, LogLevel.ERROR);

    const port = parseFlags(process.argv.slice(2));
    const server = new Server(
        db,
        parseInt(port),
        logger,
    );

    try {
        server.start();
    } catch (e: any) {
        console.log("Error during server runtime: ", e.message);
    }
}

start();