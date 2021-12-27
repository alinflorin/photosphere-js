import { ILogger } from './i-logger';

export interface PhotosphereOptions {
    cameraConstraints?: MediaStreamConstraints;
    logger?: ILogger;
}