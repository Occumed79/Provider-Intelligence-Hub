import EmscriptenModule from '../itk-wasm-emscripten-module.js';
import RunPipelineOptions from '../run-pipeline-options.js';
declare function loadEmscriptenModuleMainThread(moduleRelativePathOrURL: string | URL, baseUrl?: string, queryParams?: RunPipelineOptions['pipelineQueryParams']): Promise<EmscriptenModule>;
export default loadEmscriptenModuleMainThread;
