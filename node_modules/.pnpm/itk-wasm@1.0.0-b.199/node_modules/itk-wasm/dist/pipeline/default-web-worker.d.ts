/**
 * Set the default web worker for functions in a bundle defined with itk-wasm bindgen.
 *
 * Must be created with `createWebWorker`.
 **/
export declare function setDefaultWebWorker(webWorker: Worker | null): void;
/**
 * Get the default web worker for functions in a bundle defined with itk-wasm bindgen.
 *
 * A value of `null` indicates that the default web worker has not been set and the default web worker for the
 * bindgen package will be used.
 **/
export declare function getDefaultWebWorker(): Worker | null;
