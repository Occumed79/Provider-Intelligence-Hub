import { Vector3, Object3D, Camera, Vector2 } from 'three';
import { Intersection, IntersectionOptions } from './index.js';
import { type PointerCapture } from '../pointer.js';
import { Intersector } from './intersector.js';
export declare class RayIntersector implements Intersector {
    private readonly space;
    private readonly options;
    private readonly raycaster;
    private readonly raycasterQuaternion;
    private worldScale;
    private ready?;
    private readonly intersects;
    private readonly pointerEventsOrders;
    constructor(space: {
        current?: Object3D | null;
    }, options: IntersectionOptions & {
        minDistance?: number;
        direction?: Vector3;
    });
    isReady(): boolean;
    private prepareTransformation;
    intersectPointerCapture({ intersection, object }: PointerCapture): Intersection;
    startIntersection(): void;
    executeIntersection(object: Object3D, objectPointerEventsOrder: number | undefined): void;
    finalizeIntersection(scene: Object3D): Intersection;
}
export declare class ScreenRayIntersector implements Intersector {
    private readonly prepareTransformation;
    private readonly options;
    private readonly raycaster;
    private readonly cameraQuaternion;
    private readonly fromPosition;
    private readonly fromQuaternion;
    private readonly coords;
    private readonly viewPlane;
    private readonly intersects;
    private readonly pointerEventsOrders;
    constructor(prepareTransformation: (nativeEvent: unknown, coords: Vector2) => Camera | undefined, options: IntersectionOptions);
    isReady(): boolean;
    intersectPointerCapture({ intersection, object }: PointerCapture, nativeEvent: unknown): Intersection;
    startIntersection(nativeEvent: unknown): boolean;
    executeIntersection(object: Object3D, objectPointerEventsOrder: number | undefined): void;
    finalizeIntersection(scene: Object3D): Intersection;
}
