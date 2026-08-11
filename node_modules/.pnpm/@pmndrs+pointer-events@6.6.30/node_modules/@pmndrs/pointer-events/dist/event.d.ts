import { BaseEvent, Face, Object3D, Quaternion, Ray, Vector2, Vector3 } from 'three';
import { HtmlEvent, Properties } from './html-event.js';
import { Intersection as ThreeIntersection } from './intersections/index.js';
import { Pointer } from './pointer.js';
import type { Camera, IntersectionEvent, Intersection } from './r3f-compat.js';
export type PointerEventsMap = {
    [Key in keyof PointerEventsHandlers as EventHandlerToEventName<Key>]-?: PointerEventsHandlers[Key];
};
export type EventHandlerToEventName<T> = T extends `on${infer K}` ? Lowercase<K> : never;
export type PointerEventsHandlers = {
    onPointerMove?: PointerEvent;
    onPointerCancel?: PointerEvent;
    onPointerDown?: PointerEvent;
    onPointerUp?: PointerEvent;
    onPointerEnter?: PointerEvent;
    onPointerLeave?: PointerEvent;
    onPointerOver?: PointerEvent;
    onPointerOut?: PointerEvent;
    onClick?: PointerEvent<MouseEvent>;
    onDblClick?: PointerEvent<MouseEvent>;
    onContextMenu?: PointerEvent<MouseEvent>;
    onWheel?: WheelEvent;
};
export type NativeEvent = {
    timeStamp: number;
    button?: number;
};
export declare class PointerEvent<E extends NativeEvent = globalThis.PointerEvent> extends HtmlEvent<E> implements ThreeIntersection, BaseEvent<keyof PointerEventsMap>, IntersectionEvent<E>, Properties<Omit<globalThis.PointerEvent | globalThis.MouseEvent | globalThis.WheelEvent, 'target' | 'currentTarget' | 'srcElement'>> {
    readonly type: keyof PointerEventsMap;
    readonly bubbles: boolean;
    protected internalPointer: Pointer;
    readonly intersection: ThreeIntersection;
    readonly camera: Camera;
    readonly currentObject: Object3D;
    readonly object: Object3D;
    private readonly propagationState;
    get pointerId(): number;
    get pointerType(): string;
    get pointerState(): any;
    get distance(): number;
    get distanceToRay(): number | undefined;
    get point(): Vector3;
    get index(): number | undefined;
    get face(): Face | null | undefined;
    get faceIndex(): number | null | undefined;
    get uv(): Vector2 | undefined;
    get uv1(): Vector2 | undefined;
    get normal(): Vector3 | undefined;
    get instanceId(): number | undefined;
    get pointOnLine(): Vector3 | undefined;
    get batchId(): number | undefined;
    get pointerPosition(): Vector3;
    get pointerQuaternion(): Quaternion;
    get pointOnFace(): Vector3;
    get localPoint(): Vector3;
    get details(): ThreeIntersection['details'];
    /** same as object */
    get target(): Object3D;
    /** same as currentObject */
    get currentTarget(): Object3D;
    /** same as currentObject */
    get eventObject(): Object3D;
    /** same as object */
    get srcElement(): Object3D;
    private _pointer;
    get pointer(): Vector2;
    private _ray;
    get ray(): Ray;
    private _intersections;
    get intersections(): Intersection[];
    private _unprojectedPoint;
    get unprojectedPoint(): Vector3;
    get stopped(): boolean;
    get stoppedImmediate(): boolean;
    get delta(): number;
    constructor(type: keyof PointerEventsMap, bubbles: boolean, nativeEvent: E, internalPointer: Pointer, intersection: ThreeIntersection, camera: Camera, currentObject?: Object3D, object?: Object3D, propagationState?: {
        stopped: boolean;
        stoppedImmediate: boolean;
    });
    stopPropagation(): void;
    stopImmediatePropagation(): void;
    /**
     * for internal use
     */
    retarget(currentObject: Object3D): PointerEvent<E>;
}
export type NativeWheelEvent = {
    deltaX: number;
    deltaY: number;
    deltaZ: number;
} & NativeEvent;
export declare class WheelEvent extends PointerEvent<NativeWheelEvent> {
    get deltaX(): number;
    get deltaY(): number;
    get deltaZ(): number;
    constructor(nativeEvent: NativeWheelEvent, pointer: Pointer, intersection: ThreeIntersection, camera: Camera, currentObject?: Object3D, object?: Object3D);
    /**
     * for internal use
     */
    retarget(currentObject: Object3D): WheelEvent;
}
export declare function emitPointerEvent(event: PointerEvent<NativeEvent>): void;
export declare const listenerNames: string[];
declare module 'three' {
    interface Object3D {
        _listeners?: Record<string, Array<(event: unknown) => void> | undefined>;
    }
}
