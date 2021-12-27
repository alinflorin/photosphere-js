import { ILogger } from './i-logger';

export class ConsoleLogger extends ILogger {
    log(message: string): void {
        console.log(message);
    }

}