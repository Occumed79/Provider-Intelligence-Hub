import { Object3D, Vector3 } from 'three';
import { IntersectionOptions } from '../intersections/index.js';
import { GetCamera, Pointer, PointerOptions } from '../pointer.js';
export type RayPointerOptions = {
    /**
     * @default 0
     * distance to intersection in local space
     */
    minDistance?: number;
    /**
     * @default NegZAxis
     */
    direction?: Vector3;
} & PointerOptions & IntersectionOptions;
export declare function createRayPointer(getCamera: GetCamera, space: {
    current?: Object3D | null;
}, pointerState: any, options?: RayPointerOptions, pointerType?: string): Pointer;
