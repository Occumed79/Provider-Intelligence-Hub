import PipelineEmscriptenModule from '../pipeline-emscripten-module.js';
import PipelineInput from '../pipeline-input.js';
import PipelineOutput from '../pipeline-output.js';
import RunPipelineResult from '../run-pipeline-result.js';
declare function runPipeline(pipelineModule: PipelineEmscriptenModule, args: string[], outputs: PipelineOutput[] | null, inputs: PipelineInput[] | null): Promise<RunPipelineResult>;
export default runPipeline;
