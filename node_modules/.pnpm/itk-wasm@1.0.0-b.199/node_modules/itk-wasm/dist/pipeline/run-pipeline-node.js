import path from 'path';
import loadEmscriptenModuleNode from './internal/load-emscripten-module-node.js';
import runPipelineEmscripten from './internal/run-pipeline-emscripten.js';
function windowsToEmscriptenPath(filePath) {
    // Following mount logic in itkJSPost.js
    const fileBasename = path.basename(filePath);
    const containingDir = path.dirname(filePath);
    let mountedPath = '/';
    const splitPath = containingDir.split(path.sep);
    for (let ii = 1; ii < splitPath.length; ii++) {
        mountedPath += splitPath[ii];
        mountedPath += '/';
    }
    mountedPath += fileBasename;
    return mountedPath;
}
function replaceArgumentsWithEmscriptenPaths(args, mountDirs) {
    if (typeof process === 'undefined' || process.platform !== 'win32') {
        return args;
    }
    return args.map((arg) => {
        for (const mountDir of mountDirs) {
            if (arg.startsWith(mountDir)) {
                return windowsToEmscriptenPath(arg);
            }
        }
        return arg;
    });
}
async function runPipelineNode(pipelinePath, args, outputs, inputs, mountDirs) {
    const Module = (await loadEmscriptenModuleNode(pipelinePath));
    const mountedDirs = new Set();
    const unmountable = new Set();
    if (typeof mountDirs !== 'undefined') {
        mountDirs.forEach((dir) => {
            mountedDirs.add(Module.mountDir(dir));
        });
        /**
         * Identify mountable dirs. Some paths may be parent to others.
         * Only keep the parent paths, to avoid error when unmounting.
         */
        Array.from(mountedDirs)
            .filter((x, _, a) => a.every((y) => x === y || !x.includes(y)))
            .forEach((dir) => unmountable.add(dir));
    }
    if (typeof mountDirs !== 'undefined') {
        args = replaceArgumentsWithEmscriptenPaths(args, mountDirs);
    }
    const result = runPipelineEmscripten(Module, args, outputs, inputs);
    if (typeof mountDirs !== 'undefined') {
        unmountable.forEach((dir) => {
            Module.unmountDir(dir);
        });
    }
    return result;
}
export default runPipelineNode;
//# sourceMappingURL=run-pipeline-node.js.map