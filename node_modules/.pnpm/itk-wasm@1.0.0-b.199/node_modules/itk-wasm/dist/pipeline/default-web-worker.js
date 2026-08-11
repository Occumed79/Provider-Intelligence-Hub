let defaultWebWorker = null;
/**
 * Set the default web worker for functions in a bundle defined with itk-wasm bindgen.
 *
 * Must be created with `createWebWorker`.
 **/
export function setDefaultWebWorker(webWorker) {
    defaultWebWorker = webWorker;
}
/**
 * Get the default web worker for functions in a bundle defined with itk-wasm bindgen.
 *
 * A value of `null` indicates that the default web worker has not been set and the default web worker for the
 * bindgen package will be used.
 **/
export function getDefaultWebWorker() {
    return defaultWebWorker;
}
//# sourceMappingURL=default-web-worker.js.map