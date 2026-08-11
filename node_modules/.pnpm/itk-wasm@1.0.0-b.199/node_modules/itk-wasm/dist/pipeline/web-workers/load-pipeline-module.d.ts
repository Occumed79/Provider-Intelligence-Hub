import PipelineEmscriptenModule from '../pipeline-emscripten-module.js';
import RunPipelineOptions from '../run-pipeline-options.js';
declare function loadPipelineModule(pipelinePath: string | object, baseUrl: string, queryParams?: RunPipelineOptions['pipelineQueryParams']): Promise<PipelineEmscriptenModule>;
export default loadPipelineModule;
