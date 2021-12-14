import { PhotosphereJs } from './index';

const instance = new PhotosphereJs('#photosphere');

window.addEventListener('load', () => {
    instance.init();
});

window.addEventListener('beforeunload', () => {
    instance?.destroy();
});