import { ConsoleLogger } from './console-logger';
import { ILogger } from './i-logger';
import { PhotosphereOptions } from './photosphere-options';
export class PhotosphereJs {
    private options: PhotosphereOptions = {

    };
    private rootHtmlElement: HTMLElement | undefined;
    private videoHtmlElement: HTMLVideoElement | undefined;
    private canvasHtmlElement: HTMLCanvasElement | undefined;
    private tempCanvasHtmlElement: HTMLCanvasElement | undefined;
    private toolbarHtmlElement: HTMLDivElement | undefined;
    private cameraStream: MediaStream | undefined;
    private initPos: number[] | undefined;
    private calibrate = false;

    private width = 0;
    private height = 0;

    private originalWidth = 0;
    private originalHeight = 0;
    private logger: ILogger = new ConsoleLogger();

    private absoluteOrientationSensor: AbsoluteOrientationSensor | undefined;

    constructor(private elementSelector: string, options?: PhotosphereOptions | undefined) {
        if (options) {
            this.options = { ...this.options, ...options };
        }
        if (options?.logger != null) {
            this.logger = options.logger;
        }
    }

    async init() {
        this.selectHtmlElement();
        this.buildLayout();
        this.initAbsoluteOrientationSensor();
        await this.initListeners();
        await this.startWebcamCapture();
    }

    destroy() {
        this.disableListeners();
    }

    private async initAbsoluteOrientationSensor() {
        this.absoluteOrientationSensor = new AbsoluteOrientationSensor({
            frequency: 60,
            referenceFrame: 'device'
        });
    }

    private selectHtmlElement() {
        if (!this.elementSelector) {
            this.logger.log('No element selector defined');
            throw new Error('No element selector defined');
        }
        const selectedElement = document.querySelector(this.elementSelector);
        if (!selectedElement) {
            this.logger.log(`HTML element not found: ${this.elementSelector}`);
            throw new Error(`HTML element not found: ${this.elementSelector}`);
        }
        this.rootHtmlElement = selectedElement as HTMLElement;
    }

    private buildLayout() {
        this.rootHtmlElement!.classList.add('photosphere-js');
        this.rootHtmlElement!.style.position = 'relative';
        this.rootHtmlElement!.style.overflow = 'hidden';
        this.buildVideoElement();
        this.buildCanvasElement();
        this.buildTempCanvasElement();
        this.buildToolbarElement();
    }

    private photoButtonClickListener = () => {
        const ctx = this.tempCanvasHtmlElement!.getContext('2d')!;
        ctx.clearRect(0, 0, this.originalWidth, this.originalHeight);
        ctx.drawImage(this.videoHtmlElement!, 0, 0, this.originalWidth, this.originalHeight);
        const base64 = this.tempCanvasHtmlElement!.toDataURL('image/jpeg', 1);
    };

    private buildToolbarElement() {
        this.toolbarHtmlElement = document.createElement('div');
        this.toolbarHtmlElement.style.padding = '0';
        this.toolbarHtmlElement.style.margin = '0';
        this.toolbarHtmlElement.style.border = 'none';
        this.toolbarHtmlElement.style.backgroundColor = 'transparent';
        this.toolbarHtmlElement.style.position = 'absolute';
        this.toolbarHtmlElement.style.bottom = '0';
        this.toolbarHtmlElement.style.width = '100%';
        this.toolbarHtmlElement.style.height = '64px';
        this.toolbarHtmlElement.style.display = 'flex';
        this.toolbarHtmlElement.style.justifyContent = 'center';
        this.toolbarHtmlElement.style.alignItems = 'center';
        this.toolbarHtmlElement.style.zIndex = '3';

        const photoButton = document.createElement('div');
        photoButton.innerHTML = '📷';
        photoButton.style.cursor = 'pointer';
        photoButton.addEventListener('click', this.photoButtonClickListener);
        this.toolbarHtmlElement.appendChild(photoButton);

        this.rootHtmlElement!.appendChild(this.toolbarHtmlElement);
    }
    private buildVideoElement() {
        this.videoHtmlElement = document.createElement('video');
        this.videoHtmlElement.autoplay = true;
        this.videoHtmlElement.muted = true;
        this.videoHtmlElement.style.width = '100%';
        this.videoHtmlElement.style.height = '100%';
        this.videoHtmlElement.style.padding = '0';
        this.videoHtmlElement.style.margin = '0';
        this.videoHtmlElement.style.border = 'none';
        this.videoHtmlElement.style.objectFit = 'contain';
        this.videoHtmlElement.style.backgroundColor = 'black';
        this.videoHtmlElement.style.position = 'absolute';
        this.videoHtmlElement.style.zIndex = '2';
        this.rootHtmlElement!.appendChild(this.videoHtmlElement);
    }

    private buildCanvasElement() {
        this.canvasHtmlElement = document.createElement('canvas');
        this.canvasHtmlElement.style.backgroundColor = 'black';
        this.canvasHtmlElement.style.width = '100%';
        this.canvasHtmlElement.style.height = '100%';
        this.canvasHtmlElement.style.padding = '0';
        this.canvasHtmlElement.style.margin = '0';
        this.canvasHtmlElement.style.border = 'none';
        this.canvasHtmlElement.style.backgroundColor = 'transparent';
        this.canvasHtmlElement.style.position = 'absolute';
        this.canvasHtmlElement.style.zIndex = '2';
        this.rootHtmlElement!.appendChild(this.canvasHtmlElement);
    }

    private buildTempCanvasElement() {
        this.tempCanvasHtmlElement = document.createElement('canvas');
        this.tempCanvasHtmlElement.style.backgroundColor = 'black';
        this.tempCanvasHtmlElement.style.width = '100%';
        this.tempCanvasHtmlElement.style.height = '100%';
        this.tempCanvasHtmlElement.style.padding = '0';
        this.tempCanvasHtmlElement.style.display = 'none';
        this.tempCanvasHtmlElement.style.margin = '0';
        this.tempCanvasHtmlElement.style.border = 'none';
        this.tempCanvasHtmlElement.style.backgroundColor = 'transparent';
        this.tempCanvasHtmlElement.style.position = 'absolute';
        this.tempCanvasHtmlElement.style.zIndex = '-100';
        this.rootHtmlElement!.appendChild(this.tempCanvasHtmlElement);
    }

    private resizeCanvasElementToOverlayVideo() {
        const [actualWidth, actualHeight] = this.getVideoActualSize();
        this.width = actualWidth;
        this.height = actualHeight;
        this.originalWidth = this.videoHtmlElement!.videoWidth;
        this.originalHeight = this.videoHtmlElement!.videoHeight;
        this.canvasHtmlElement!.style.width = actualWidth + 'px';
        this.canvasHtmlElement!.style.height = actualHeight + 'px';
        this.tempCanvasHtmlElement!.style.width = actualWidth + 'px';
        this.tempCanvasHtmlElement!.style.height = actualHeight + 'px';
        this.tempCanvasHtmlElement!.width = this.originalWidth;
        this.tempCanvasHtmlElement!.height = this.originalHeight;
        this.canvasHtmlElement!.width = actualWidth;
        this.canvasHtmlElement!.height = actualHeight;
        this.canvasHtmlElement!.style.top = Math.round((this.videoHtmlElement!.clientHeight - actualHeight) / 2) + 'px';
        this.canvasHtmlElement!.style.left = Math.round((this.videoHtmlElement!.clientWidth - actualWidth) / 2) + 'px';
    }

    private resizeListener = () => {
        this.resizeCanvasElementToOverlayVideo();
    };

    private videoLoadedMetadataListener = () => {
        this.resizeCanvasElementToOverlayVideo();
    };

    private videoPlayingListener = () => {
        this.calibrate = true;
    };

    private sensorReadingListener = () => {
        const data = this.absoluteOrientationSensor!.quaternion!;
        if (this.calibrate) {
            this.initPos = data;
            this.calibrate = false;
            return;
        }
        if (!this.calibrate && this.initPos == null) {
            return;
        }
        console.log(data);
    };

    private sensorErrorListener: any = (e: SensorErrorEvent) => {
        this.logger.log(`Sensor error: ${e.error}`);
        throw e;
    };

    private async initListeners() {
        window.addEventListener('resize', this.resizeListener);
        this.videoHtmlElement!.addEventListener('loadedmetadata', this.videoLoadedMetadataListener);
        this.videoHtmlElement!.addEventListener('playing', this.videoPlayingListener);

        this.absoluteOrientationSensor!.addEventListener('reading', this.sensorReadingListener);
        this.absoluteOrientationSensor!.addEventListener('error', this.sensorErrorListener);
        const results = await Promise.all([navigator.permissions.query({ name: "accelerometer" } as any),
        navigator.permissions.query({ name: "magnetometer" } as any),
        navigator.permissions.query({ name: "gyroscope" } as any)]);
        if (results.every(result => result.state === "granted")) {
            this.absoluteOrientationSensor!.start();
            this.logger.log("AbsoluteOrientationSensor started.");
        } else {
            this.logger.log("No permissions to use AbsoluteOrientationSensor.");
            throw new Error("No permissions to use AbsoluteOrientationSensor.");
        }
    }

    private disableListeners() {
        window.removeEventListener('resize', this.resizeListener);
        this.videoHtmlElement!.removeEventListener('loadedmetadata', this.videoLoadedMetadataListener);
        this.videoHtmlElement!.removeEventListener('playing', this.videoPlayingListener);

        this.absoluteOrientationSensor!.removeEventListener('reading', this.sensorReadingListener);
        this.absoluteOrientationSensor!.removeEventListener('error', this.sensorErrorListener);
        this.absoluteOrientationSensor!.stop();
    }

    private async startWebcamCapture() {
        if (!this.isCameraSupported()) {
            this.logger.log('Camera is not supported');
            throw new Error('Camera is not supported');
        }
        const constraints: MediaStreamConstraints = {
            video: { width: 4096, height: 2160 },
            audio: false,
        };
        this.cameraStream = await navigator.mediaDevices.getUserMedia({ ...this.options.cameraConstraints, ...constraints });
        if (!this.cameraStream) {
            this.logger.log('Cannot get webcam stream');
            throw new Error('Cannot get webcam stream');
        }
        this.videoHtmlElement!.srcObject = this.cameraStream;
    }

    private isCameraSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    private getVideoActualSize() {
        const ratio = this.videoHtmlElement!.videoWidth / this.videoHtmlElement!.videoHeight;
        let width = this.videoHtmlElement!.clientHeight * ratio;
        let height = this.videoHtmlElement!.clientHeight;
        if (width > this.videoHtmlElement!.clientWidth) {
            width = this.videoHtmlElement!.clientWidth;
            height = Math.floor(this.videoHtmlElement!.clientWidth / ratio);
        }
        if (width > this.videoHtmlElement!.clientWidth) {
            width = this.videoHtmlElement!.clientWidth;
        }

        if (height > this.videoHtmlElement!.clientHeight) {
            height = this.videoHtmlElement!.clientHeight;
        }
        return [width, height];
    }
}