import PipelineOutput from './pipeline-output.js';
import PipelineInput from './pipeline-input.js';
import RunPipelineResult from './run-pipeline-result.js';
import RunPipelineOptions from './run-pipeline-options.js';
declare function runPipeline(pipelinePath: string | URL, args: string[], outputs: PipelineOutput[] | null, inputs: PipelineInput[] | null, options?: RunPipelineOptions): Promise<RunPipelineResult>;
export default runPipeline;
