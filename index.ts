import Server from './lib/server/server';
import {LogLevel, TextLogger} from "./lib/utils/logger";
import * as fs from "fs";
import DB from "./lib/database/db";

/**
 * Initializes and starts the application.
 *
 * - Creates the necessary logging directory and file if not already present.
 * - Connects to the database and applies migrations.
 *   - Logs the success or failure of the database migration process.
 * - Instantiates the server with the database, logger, and specified port.
 * - Starts the server and handles any runtime errors during startup.
 *
 * This function is asynchronous and uses file system operations, database interactions,
 * and server initialization processes. It logs important events to the logger
 * for tracking and debugging purposes.
 *
 * Note: If there are any errors with database connection/migration or
 * during server initialization, appropriate error handling is performed.
 */
const start = async () => {

    // Logger
    fs.mkdirSync(`${__dirname}/logs`, {recursive: true})
    const logger = new TextLogger(`${__dirname}/logs/log.txt`);

    // Database
    const db = new DB();
    try {
        await db.connect();
        //await db.migrate(); -- for migrations
        //await logger.log('Database Migrated', LogLevel.INFO);
    } catch (e: any) {
        await logger.log('ERRCON: No Database Connection', LogLevel.ERROR);
        return
    }

    // Server
    const server = new Server(db, 8080, logger);
    try {
        server.start();
    } catch (e: any) {
        console.log("Error during server runtime: ", e.message);
    }
}

start();