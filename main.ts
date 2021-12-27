import { PhotosphereJs } from './index';

const instance = new PhotosphereJs('#photosphere');

window.addEventListener('load', async () => {
    try {
        await instance.init();
    } catch (err) {
        alert(err);
    }
});

window.addEventListener('beforeunload', () => {
    instance?.destroy();
});