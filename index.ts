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

    try {
        await db.connect();
        await db.migrate();
        await logger.log('Database Migrated', LogLevel.INFO);
    } catch (e: any) {
        await logger.log('Database ' + e, LogLevel.ERROR);
        return
    }

    console.log('hit');

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