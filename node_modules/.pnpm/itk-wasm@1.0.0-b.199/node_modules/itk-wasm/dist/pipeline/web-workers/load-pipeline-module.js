import loadEmscriptenModule from '../internal/load-emscripten-module-web-worker.js';
// To cache loaded pipeline modules wrapped in a Promise
const pipelineToModule = new Map();
async function loadPipelineModule(pipelinePath, baseUrl, queryParams) {
    let moduleRelativePathOrURL = pipelinePath;
    let pipeline = pipelinePath;
    let pipelineModule = null;
    if (typeof pipelinePath !== 'string') {
        moduleRelativePathOrURL = new URL(pipelinePath.href);
        pipeline = moduleRelativePathOrURL.href;
    }
    if (pipelineToModule.has(pipeline)) {
        pipelineModule = await pipelineToModule.get(pipeline);
    }
    else {
        pipelineToModule.set(pipeline, loadEmscriptenModule(moduleRelativePathOrURL, baseUrl, queryParams));
        pipelineModule = await pipelineToModule.get(pipeline);
    }
    return pipelineModule;
}
export default loadPipelineModule;
//# sourceMappingURL=load-pipeline-module.js.map