import RunPipelineOptions from './run-pipeline-options';
declare function createWebWorker(pipelineWorkerUrl?: string | null, queryParams?: RunPipelineOptions['pipelineQueryParams']): Promise<Worker>;
export default createWebWorker;
