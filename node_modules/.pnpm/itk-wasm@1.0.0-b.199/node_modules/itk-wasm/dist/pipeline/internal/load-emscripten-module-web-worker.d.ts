import ITKWasmEmscriptenModule from '../itk-wasm-emscripten-module.js';
import RunPipelineOptions from '../run-pipeline-options.js';
declare function loadEmscriptenModuleWebWorker(moduleRelativePathOrURL: string | URL, baseUrl: string, queryParams?: RunPipelineOptions['pipelineQueryParams']): Promise<ITKWasmEmscriptenModule>;
export default loadEmscriptenModuleWebWorker;
