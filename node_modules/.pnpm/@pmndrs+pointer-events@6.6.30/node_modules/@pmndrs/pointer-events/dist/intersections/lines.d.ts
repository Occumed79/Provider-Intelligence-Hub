import { Vector3, Object3D } from 'three';
import { Intersector } from './intersector.js';
import { Intersection, IntersectionOptions } from '../index.js';
import type { PointerCapture } from '../pointer.js';
export declare class LinesIntersector implements Intersector {
    private readonly space;
    private readonly options;
    private raycasters;
    private fromMatrixWorld;
    private ready?;
    private intersects;
    private readonly pointerEventsOrders;
    private readonly raycasterIndices;
    constructor(space: {
        current?: Object3D | null;
    }, options: IntersectionOptions & {
        linePoints?: Array<Vector3>;
        minDistance?: number;
    });
    isReady(): boolean;
    private prepareTransformation;
    intersectPointerCapture({ intersection, object }: PointerCapture): Intersection;
    startIntersection(): void;
    executeIntersection(object: Object3D, objectPointerEventsOrder: number | undefined): void;
    finalizeIntersection(scene: Object3D): Intersection;
}
