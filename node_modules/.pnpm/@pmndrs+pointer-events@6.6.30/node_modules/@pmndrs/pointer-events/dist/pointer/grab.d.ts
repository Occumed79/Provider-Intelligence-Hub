import { Object3D } from 'three';
import { IntersectionOptions } from '../intersections/index.js';
import { GetCamera, Pointer, PointerOptions } from '../pointer.js';
export type GrabPointerOptions = {
    /**
     * @default 0.07
     */
    radius?: number;
} & PointerOptions & IntersectionOptions;
export declare function createGrabPointer(getCamera: GetCamera, space: {
    current?: Object3D | null;
}, pointerState: any, options?: GrabPointerOptions, pointerType?: string): Pointer;
