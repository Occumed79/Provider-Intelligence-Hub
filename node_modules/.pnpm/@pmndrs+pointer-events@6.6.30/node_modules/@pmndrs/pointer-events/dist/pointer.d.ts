import { Object3D, OrthographicCamera, PerspectiveCamera } from 'three';
import { NativeEvent, NativeWheelEvent } from './event.js';
import { Intersection } from './intersections/index.js';
import { Intersector } from './intersections/intersector.js';
declare const buttonsDownTimeKey: unique symbol;
declare const buttonsClickTimeKey: unique symbol;
export type AllowedPointerEvents = 'none' | 'auto' | 'listener';
export type AllowedPointerEventsType = 'all' | ((poinerId: number, pointerType: string, pointerState: unknown) => boolean) | {
    allow: string | Array<string>;
} | {
    deny: string | Array<string>;
};
declare module 'three' {
    interface Object3D {
        [buttonsDownTimeKey]?: ButtonsTime;
        [buttonsClickTimeKey]?: ButtonsTime;
    }
}
type ButtonsTime = Map<number, number>;
export type PointerCapture = {
    object: Object3D;
    intersection: Intersection;
};
export type PointerOptions = {
    /**
     * @deprecated use clickThresholdMs instead
     */
    clickThesholdMs?: number;
    /**
     * @default 300
     */
    clickThresholdMs?: number;
    /**
     * @default 500
     */
    dblClickThresholdMs?: number;
    /**
     * @default 2
     */
    contextMenuButton?: number;
    /**
     * filtering the intersectable objects
     * @default undefined
     */
    filter?: (object: Object3D, pointerEvents: AllowedPointerEvents, pointerEventsType: AllowedPointerEventsType, pointerEventsOrder: number) => boolean;
};
declare global {
    namespace globalThis {
        var pointerEventspointerMap: Map<number, Pointer> | undefined;
    }
}
declare module 'three' {
    interface Object3D {
        setPointerCapture(pointerId: number): void;
        releasePointerCapture(pointerId: number): void;
        hasPointerCapture(pointerId: number): boolean;
        intersectChildren?: boolean;
        interactableDescendants?: Array<Object3D>;
        /**
         * @deprecated
         */
        ancestorsHaveListeners?: boolean;
        ancestorsHavePointerListeners?: boolean;
        ancestorsHaveWheelListeners?: boolean;
    }
}
export declare function getPointerById(pointerId: number): Pointer | undefined;
export type GetCamera = () => PerspectiveCamera | OrthographicCamera;
export declare class Pointer {
    readonly id: number;
    readonly type: string;
    readonly state: any;
    readonly intersector: Intersector;
    private readonly getCamera;
    private readonly onMoveCommited?;
    private readonly parentSetPointerCapture?;
    private readonly parentReleasePointerCapture?;
    readonly options: PointerOptions;
    private prevIntersection;
    private intersection;
    private prevEnabled;
    private enabled;
    private wheelIntersection;
    /**
     * ordered leaf -> root (bottom -> top)
     */
    private pointerEntered;
    private pointerEnteredHelper;
    private pointerCapture;
    private buttonsDownTime;
    private readonly buttonsDown;
    private wasMoved;
    private onFirstMove;
    constructor(id: number, type: string, state: any, intersector: Intersector, getCamera: GetCamera, onMoveCommited?: ((pointer: Pointer) => void) | undefined, parentSetPointerCapture?: (() => void) | undefined, parentReleasePointerCapture?: (() => void) | undefined, options?: PointerOptions);
    getPointerCapture(): PointerCapture | undefined;
    hasCaptured(object: Object3D): boolean;
    setCapture(object: Object3D | undefined): void;
    getButtonsDown(): ReadonlySet<number>;
    /**
     * @returns undefined if no intersection was executed yet
     */
    getIntersection(): Intersection | undefined;
    getEnabled(): boolean;
    setEnabled(enabled: boolean, nativeEvent: NativeEvent, commit?: boolean): void;
    computeIntersection(type: 'wheel' | 'pointer', scene: Object3D, nativeEvent: NativeEvent): Intersection;
    setIntersection(intersection: Intersection): void;
    commit(nativeEvent: NativeEvent, emitMove: boolean): void;
    /**
     * computes and commits a move
     */
    move(scene: Object3D, nativeEvent: NativeEvent): void;
    /**
     * computes and commits the pointer if a move has not yet occured
     */
    over(scene: Object3D, nativeEvent: NativeEvent): void;
    /**
     * emits a move without (re-)computing the intersection
     * just emitting a move event to the current intersection
     */
    emitMove(nativeEvent: NativeEvent): void;
    down(nativeEvent: NativeEvent & {
        button: number;
    }): void;
    up(nativeEvent: NativeEvent & {
        button: number;
    }): void;
    cancel(nativeEvent: NativeEvent): void;
    wheel(scene: Object3D, nativeEvent: NativeWheelEvent, useMoveIntersection?: boolean): void;
    emitWheel(nativeEvent: NativeWheelEvent, useMoveIntersection?: boolean): void;
    exit(nativeEvent: NativeEvent): void;
    private clearPointerCapture;
}
export {};
