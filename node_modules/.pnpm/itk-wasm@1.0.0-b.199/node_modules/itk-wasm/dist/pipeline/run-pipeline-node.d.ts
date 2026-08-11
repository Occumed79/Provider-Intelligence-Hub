import PipelineOutput from './pipeline-output.js';
import PipelineInput from './pipeline-input.js';
import RunPipelineResult from './run-pipeline-result.js';
declare function runPipelineNode(pipelinePath: string, args: string[], outputs: PipelineOutput[], inputs: PipelineInput[] | null, mountDirs?: Set<string>): Promise<RunPipelineResult>;
export default runPipelineNode;
