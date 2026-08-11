import { Object3D } from 'three';
import { NativeEvent } from './event.js';
import { Intersection } from './index.js';
import { Pointer, PointerCapture } from './pointer.js';
export declare class CombinedPointer {
    private readonly enableMultiplePointers;
    private readonly pointers;
    private readonly isDefaults;
    private enabled;
    private activePointer;
    private readonly nonCapturedPointers;
    constructor(enableMultiplePointers: boolean);
    register(pointer: Pointer | CombinedPointer, isDefault?: boolean): () => void;
    private unregister;
    /**
     * @returns true if any pointer is captured
     */
    private startIntersection;
    /**
     * only for internal use
     */
    getIntersection(): Intersection | undefined;
    /**
     * only for internal use
     */
    getPointerCapture(): PointerCapture | undefined;
    private computeActivePointer;
    /**
     * only for internal use
     */
    commit(nativeEvent: NativeEvent, emitMove: boolean, computeActivePointer?: boolean): void;
    move(scene: Object3D, nativeEvent: NativeEvent): void;
    setEnabled(enabled: boolean, nativeEvent: NativeEvent): void;
}
