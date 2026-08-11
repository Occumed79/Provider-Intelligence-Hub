import { Object3D } from 'three';
import { IntersectionOptions } from '../intersections/index.js';
import { GetCamera, Pointer, PointerOptions } from '../pointer.js';
export type TouchPointerOptions = {
    /**
     * @default 0.1
     */
    hoverRadius?: number;
    /**
     * @default 0.03
     */
    downRadius?: number;
    /**
     * @default 0
     */
    button?: number;
} & PointerOptions & IntersectionOptions;
export declare function createTouchPointer(getCamera: GetCamera, space: {
    current?: Object3D | null;
}, pointerState: any, options?: TouchPointerOptions, pointerType?: string): Pointer;
