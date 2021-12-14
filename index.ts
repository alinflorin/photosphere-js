import { PhotosphereOptions } from './photosphere-options';
export class PhotosphereJs {
    private options: PhotosphereOptions = {

    };
    private rootHtmlElement: HTMLElement | undefined;
    private videoHtmlElement: HTMLVideoElement | undefined;
    private canvasHtmlElement: HTMLCanvasElement | undefined;
    private cameraStream: MediaStream | undefined;

    constructor(private elementSelector: string, options?: PhotosphereOptions | undefined) {
        if (options) {
            this.options = { ...this.options, ...options };
        }
    }

    async init() {
        this.selectHtmlElement();
        this.buildLayout();
        await this.startWebcamCapture();
    }

    destroy() {

    }

    private selectHtmlElement() {
        if (!this.elementSelector) {
            throw new Error('No element selector defined');
        }
        const selectedElement = document.querySelector(this.elementSelector);
        if (!selectedElement) {
            throw new Error(`HTML element not found: ${this.elementSelector}`);
        }
        this.rootHtmlElement = selectedElement as HTMLElement;
    }

    private buildLayout() {
        this.rootHtmlElement!.classList.add('photosphere-js');
        this.rootHtmlElement!.style.position = 'relative';
        this.buildVideoElement();
        this.buildCanvasElement();
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
        // this.videoHtmlElement.style.objectFit = 'contain';
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

    private async startWebcamCapture() {
        if (!this.isCameraSupported()) {
            throw new Error('Camera is not supported');
        }
        const constraints: MediaStreamConstraints = {
            video: true,
            audio: false
        };
        this.cameraStream = await navigator.mediaDevices.getUserMedia({ ...this.options.cameraConstraints, ...constraints });
        if (!this.cameraStream) {
            throw new Error('Cannot get webcam stream');
        }
        this.videoHtmlElement!.srcObject = this.cameraStream;
    }

    private isCameraSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
}