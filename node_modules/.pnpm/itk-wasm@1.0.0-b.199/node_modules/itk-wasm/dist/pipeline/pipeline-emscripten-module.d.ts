import EmscriptenModule from './itk-wasm-emscripten-module.js';
interface PipelineEmscriptenModule extends EmscriptenModule {
    callMain: (args: string[]) => number;
    cwrap: typeof cwrap;
    ccall: typeof ccall;
    lengthBytesUTF8: typeof lengthBytesUTF8;
    writeArrayToMemory: typeof writeArrayToMemory;
    stringToUTF8: typeof stringToUTF8;
    UTF8ToString: (ptr: number) => string;
    stackSave: () => number;
    stackRestore: (ptr: number) => void;
    resetModuleStdout: () => void;
    resetModuleStderr: () => void;
    getModuleStdout: () => string;
    getModuleStderr: () => string;
    print: (text: string) => void;
    printErr: (text: string) => void;
    getExceptionMessage: (num: number) => string;
}
export default PipelineEmscriptenModule;
