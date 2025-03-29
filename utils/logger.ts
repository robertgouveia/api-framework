import * as fs from 'fs';

export interface ILogger {
    log(message: string, level?: LogLevel): void;
}

export enum LogLevel {
    INFO,
    WARN,
    ERROR,
    DEBUG,
}

abstract class Logger implements ILogger {
    protected formatMessage(message: string, level: LogLevel): string {
        return `${new Date().toISOString()} [${LogLevel[level]}] ${message}`;
    }

    public log(message: string, level: LogLevel = LogLevel.INFO) {
        console.log(this.formatMessage(message, level));
    }
}

export class ConsoleLogger extends Logger { }

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