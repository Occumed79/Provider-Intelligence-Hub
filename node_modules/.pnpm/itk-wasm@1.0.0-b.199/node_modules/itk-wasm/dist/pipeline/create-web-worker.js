import axios from 'axios';
async function createWebWorker(pipelineWorkerUrl, queryParams) {
    const workerUrl = pipelineWorkerUrl;
    let worker = null;
    if (workerUrl == null) {
        // Use the version built with the bundler
        //
        // Bundlers, e.g. WebPack, Vite, Rollup, see these paths at build time
        worker = new Worker(new URL('./web-workers/itk-wasm-pipeline.worker.js', import.meta.url), { type: 'module' });
    }
    else {
        if (workerUrl.startsWith('http')) {
            const response = await axios.get(workerUrl, { responseType: 'blob', params: queryParams });
            const workerObjectUrl = URL.createObjectURL(response.data);
            worker = new Worker(workerObjectUrl, { type: 'module' });
        }
        else {
            worker = new Worker(workerUrl, { type: 'module' });
        }
    }
    return worker;
}
export default createWebWorker;
//# sourceMappingURL=create-web-worker.js.map