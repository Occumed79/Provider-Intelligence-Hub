import * as Comlink from 'comlink';
import createWorkerProxy from './create-worker-proxy.js';
import loadEmscriptenModuleMainThread from './internal/load-emscripten-module-main-thread.js';
import { simd } from 'wasm-feature-detect';
import InterfaceTypes from '../interface-types/interface-types.js';
import runPipelineEmscripten from './internal/run-pipeline-emscripten.js';
import getTransferables from '../get-transferables.js';
import imageTransferables from './internal/image-transferables.js';
import meshTransferables from './internal/mesh-transferables.js';
import polyDataTransferables from './internal/poly-data-transferables.js';
import { getPipelinesBaseUrl } from './pipelines-base-url.js';
import { getPipelinesQueryParams } from './pipelines-query-params.js';
import { getPipelineWorkerUrl } from './pipeline-worker-url.js';
// To cache loaded pipeline modules
const pipelineToModule = new Map();
function defaultPipelineWorkerUrl() {
    let result = getPipelineWorkerUrl();
    if (typeof result === 'undefined') {
        result = null;
    }
    return result;
}
function defaultPipelinesBaseUrl() {
    let result = getPipelinesBaseUrl();
    if (typeof result === 'undefined') {
        result = new URL('/pipelines', document.location.origin).href;
    }
    return result;
}
function defaultPipelinesQueryParams() {
    let result = getPipelinesQueryParams();
    if (typeof result === 'undefined') {
        result = {};
    }
    return result;
}
async function loadPipelineModule(pipelinePath, pipelineBaseUrl, pipelineQueryParams) {
    let moduleRelativePathOrURL = pipelinePath;
    let pipeline = pipelinePath;
    if (typeof pipelinePath !== 'string') {
        moduleRelativePathOrURL = new URL(pipelinePath.href);
        pipeline = moduleRelativePathOrURL.href;
    }
    if (pipelineToModule.has(pipeline)) {
        return pipelineToModule.get(pipeline);
    }
    else {
        const pipelineModule = (await loadEmscriptenModuleMainThread(pipelinePath, pipelineBaseUrl?.toString() ?? defaultPipelinesBaseUrl(), pipelineQueryParams ?? defaultPipelinesQueryParams()));
        pipelineToModule.set(pipeline, pipelineModule);
        return pipelineModule;
    }
}
async function runPipeline(pipelinePath, args, outputs, inputs, options) {
    if (!await simd()) {
        const simdErrorMessage = 'WebAssembly SIMD support is required -- please update your browser.';
        alert(simdErrorMessage);
        throw new Error(simdErrorMessage);
    }
    const webWorker = options?.webWorker ?? null;
    if (webWorker === false) {
        const pipelineModule = await loadPipelineModule(pipelinePath.toString(), options?.pipelineBaseUrl, options?.pipelineQueryParams ?? defaultPipelinesQueryParams());
        const result = runPipelineEmscripten(pipelineModule, args, outputs, inputs);
        return result;
    }
    let worker = webWorker;
    const pipelineWorkerUrl = options?.pipelineWorkerUrl ?? defaultPipelineWorkerUrl();
    const pipelineWorkerUrlString = typeof pipelineWorkerUrl !== 'string' && typeof pipelineWorkerUrl?.href !== 'undefined' ? pipelineWorkerUrl.href : pipelineWorkerUrl;
    const { workerProxy, worker: usedWorker } = await createWorkerProxy(worker, pipelineWorkerUrlString, options?.pipelineQueryParams ?? defaultPipelinesQueryParams());
    worker = usedWorker;
    const transferables = [];
    if (!(inputs == null) && inputs.length > 0) {
        inputs.forEach(function (input) {
            if (input.type === InterfaceTypes.BinaryStream) {
                // Binary data
                const dataArray = input.data.data;
                transferables.push(dataArray);
            }
            else if (input.type === InterfaceTypes.BinaryFile) {
                // Binary data
                const dataArray = input.data.data;
                transferables.push(dataArray);
            }
            else if (input.type === InterfaceTypes.Image) {
                // Image data
                const image = input.data;
                if (image.data !== null) {
                    transferables.push(...imageTransferables(image));
                }
            }
            else if (input.type === InterfaceTypes.Mesh) {
                // Mesh data
                const mesh = input.data;
                transferables.push(...meshTransferables(mesh));
            }
            else if (input.type === InterfaceTypes.PolyData) {
                // PolyData data
                const polyData = input.data;
                transferables.push(...polyDataTransferables(polyData));
            }
        });
    }
    const pipelineBaseUrl = options?.pipelineBaseUrl ?? defaultPipelinesBaseUrl();
    const pipelineBaseUrlString = typeof pipelineBaseUrl !== 'string' && typeof pipelineBaseUrl?.href !== 'undefined' ? pipelineBaseUrl.href : pipelineBaseUrl;
    const transferedInputs = (inputs != null) ? Comlink.transfer(inputs, getTransferables(transferables, options?.noCopy)) : null;
    const result = await workerProxy.runPipeline(pipelinePath.toString(), pipelineBaseUrlString, args, outputs, transferedInputs, options?.pipelineQueryParams ?? defaultPipelinesQueryParams());
    return {
        returnValue: result.returnValue,
        stdout: result.stdout,
        stderr: result.stderr,
        outputs: result.outputs,
        webWorker: worker
    };
}
export default runPipeline;
//# sourceMappingURL=run-pipeline.js.map