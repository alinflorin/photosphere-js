import { DomLogger } from './dom-logger';
import { PhotosphereJs } from './index';

const instance = new PhotosphereJs('#photosphere', {
    logger: new DomLogger(document.getElementById('log')!)
});

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