import * as Comlink from 'comlink';
import createWebWorker from './create-web-worker.js';
function workerToWorkerProxy(worker) {
    const workerProxy = Comlink.wrap(worker);
    const itkWebWorker = worker;
    itkWebWorker.terminated = false;
    itkWebWorker.workerProxy = workerProxy;
    itkWebWorker.originalTerminate = itkWebWorker.terminate;
    itkWebWorker.terminate = () => {
        itkWebWorker.terminated = true;
        itkWebWorker.workerProxy[Comlink.releaseProxy]();
        itkWebWorker.originalTerminate();
    };
    return { workerProxy, worker: itkWebWorker };
}
// Internal function to create a web worker proxy
async function createWorkerProxy(existingWorker, pipelineWorkerUrl, queryParams) {
    let workerProxy;
    if (existingWorker != null) {
        // See if we have a worker promise attached the worker, if so reuse it. This ensures
        // that we can safely reuse the worker without issues.
        const itkWebWorker = existingWorker;
        if (itkWebWorker.workerProxy !== undefined) {
            workerProxy = itkWebWorker.workerProxy;
            return { workerProxy, worker: itkWebWorker };
        }
        else {
            return workerToWorkerProxy(existingWorker);
        }
    }
    const worker = await createWebWorker(pipelineWorkerUrl, queryParams);
    return workerToWorkerProxy(worker);
}
export default createWorkerProxy;
//# sourceMappingURL=create-worker-proxy.js.map