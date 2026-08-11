import { Object3D, OrthographicCamera, PerspectiveCamera, Scene } from 'three';
import { NativeEvent } from './event.js';
import { IntersectionOptions } from './intersections/index.js';
import { GetCamera, PointerOptions } from './pointer.js';
export type ForwardablePointerEvent = {
    pointerId: number;
    pointerType: string;
    pointerState?: any;
} & NativeEvent;
export type ForwardEventsOptions = {
    /**
     * @default true
     * batches events per frame and limits scene intersections to one intersection per frame per pointer
     * if the scene is not rendered on every frame. this option should be disabled so that events are emitted directly without waiting for the next frame
     *
     * If you are having issues when executing functions that require a user action, e.g., uploading a file through a input element in a safari, please set this to `false`.
     */
    batchEvents?: boolean;
    /**
     * @default false
     * intersections can either be done when the pointer is moved, or on every frame
     */
    intersectEveryFrame?: boolean;
    /**
     * @default true
     */
    forwardPointerCapture?: boolean;
    /**
     * @default "forward-"
     */
    pointerTypePrefix?: string;
} & PointerOptions & IntersectionOptions;
/**
 * sets the `pointerTypePrefix` to `"screen-"`. Therefore, a event with pointerType `touch` is forwarded to the scene as `"screen-touch"`
 */
export declare function forwardHtmlEvents(fromElement: HTMLElement, getCamera: GetCamera | OrthographicCamera | PerspectiveCamera, scene: Object3D, options?: ForwardEventsOptions): {
    destroy: () => void;
    update: () => void;
};
export declare function forwardObjectEvents(fromPortal: Object3D, getCamera: GetCamera, scene: Scene, options?: ForwardEventsOptions): {
    destroy: () => void;
    update: () => void;
};
