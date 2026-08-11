import * as Comlink from 'comlink';
import runPipelineEmscripten from '../internal/run-pipeline-emscripten.js';
import getTransferables from '../../get-transferables.js';
import InterfaceTypes from '../../interface-types/interface-types.js';
import imageTransferables from '../internal/image-transferables.js';
import meshTransferables from '../internal/mesh-transferables.js';
import polyDataTransferables from '../internal/poly-data-transferables.js';
async function runPipeline(pipelineModule, args, outputs, inputs) {
    const result = runPipelineEmscripten(pipelineModule, args, outputs, inputs);
    const transferables = [];
    result.outputs.forEach(function (output) {
        if (output.type === InterfaceTypes.BinaryStream || output.type === InterfaceTypes.BinaryFile) {
            // Binary data
            const binary = output.data;
            transferables.push(binary);
        }
        else if (output.type === InterfaceTypes.Image) {
            // Image data
            const image = output.data;
            transferables.push(...imageTransferables(image));
        }
        else if (output.type === InterfaceTypes.Mesh) {
            const mesh = output.data;
            transferables.push(...meshTransferables(mesh));
        }
        else if (output.type === InterfaceTypes.PolyData) {
            const polyData = output.data;
            transferables.push(...polyDataTransferables(polyData));
        }
    });
    return Comlink.transfer(result, getTransferables(transferables, true));
}
export default runPipeline;
//# sourceMappingURL=run-pipeline.js.map