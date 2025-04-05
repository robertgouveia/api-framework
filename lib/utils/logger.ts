import * as fs from 'fs';

/**
 * Interface representing a logger that processes and outputs log messages.
 *
 * Implementations of this interface should define how messages are handled
 * and output based on the provided log level.
 */
export interface ILogger {
    log(message: string, level?: LogLevel): void;
}

/**
 * Enum representing various logging levels.
 *
 * This enum can be utilized to specify the severity or type of log messages in an application.
 * The available log levels are:
 *
 * - INFO: General information about application execution.
 * - WARN: Events that are not errors but may require attention.
 * - ERROR: Error events that hinder normal execution flow.
 * - DEBUG: Detailed debugging information, typically used during development.
 */
export enum LogLevel {
    INFO,
    WARN,
    ERROR,
    DEBUG,
}

/**
 * Abstract class representing a generic logger with basic message formatting and logging functionality.
 * Classes extending this abstract class can provide specialized logging implementations.
 */
abstract class Logger implements ILogger {
    protected formatMessage(message: string, level: LogLevel): string {
        return `${new Date().toISOString()} [${LogLevel[level]}] ${message}`;
    }

    public log(message: string, level: LogLevel = LogLevel.INFO) {
        console.log(this.formatMessage(message, level));
    }
}

/**
 * ConsoleLogger class extends the Logger base class to provide logging functionality
 * by outputting messages to the console. It can be used for debugging and monitoring
 * application behavior in real time.
 *
 * This class provides methods for logging messages at various levels, such as
 * informational, warning, and error logs, depending on the implementation
 * of the parent Logger class.
 *
 * Inherits all the logging capabilities of the parent Logger. Overrides or
 * implements additional functionalities for handling console-specific logging behavior
 * if defined explicitly.
 */
export class ConsoleLogger extends Logger { }

/**
 * A specialized logger class that extends the Logger base class
 * to log messages to a specified text file.
 */
export class TextLogger extends Logger {
    private readonly file: string = 'log.txt';

    constructor(file: string) {
        super();
        this.file = file;
    }

    public override async log(message: string, level: LogLevel = LogLevel.INFO) {
        super.log(message, level);

        try {
            const fd = await fs.promises.open(this.file, 'a');
            await  fd.writeFile(this.formatMessage(message, level) + '\n');
            await fd.close();
        } catch {
            super.log('Unable to read to: ' + this.file, LogLevel.ERROR);
        }
    }
}