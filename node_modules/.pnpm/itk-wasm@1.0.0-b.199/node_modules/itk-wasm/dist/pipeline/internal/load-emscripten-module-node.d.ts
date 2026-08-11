import EmscriptenModule from '../itk-wasm-emscripten-module.js';
declare function loadEmscriptenModuleNode(modulePath: string): Promise<EmscriptenModule>;
export default loadEmscriptenModuleNode;
