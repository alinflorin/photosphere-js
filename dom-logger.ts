import { ILogger } from './i-logger';

export class DomLogger extends ILogger {
    constructor(private domElement: HTMLElement) {
        super();
    }
    log(message: string): void {
        this.domElement.innerHTML += `${message} <br />`;
    }

}