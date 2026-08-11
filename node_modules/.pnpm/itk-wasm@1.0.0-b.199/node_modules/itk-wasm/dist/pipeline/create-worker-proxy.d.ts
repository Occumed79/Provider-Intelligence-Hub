import WorkerProxy from './web-workers/worker-proxy.js';
import ItkWorker from './itk-worker.js';
import RunPipelineOptions from './run-pipeline-options.js';
interface createWorkerProxyResult {
    workerProxy: WorkerProxy;
    worker: ItkWorker;
}
declare function createWorkerProxy(existingWorker: Worker | null, pipelineWorkerUrl?: string | null, queryParams?: RunPipelineOptions['pipelineQueryParams']): Promise<createWorkerProxyResult>;
export default createWorkerProxy;
