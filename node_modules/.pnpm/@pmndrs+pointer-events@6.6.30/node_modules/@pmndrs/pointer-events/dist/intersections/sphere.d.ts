import { Object3D, Sphere, Intersection as ThreeIntersection } from 'three';
import { Intersector } from './intersector.js';
import { Intersection, IntersectionOptions } from '../index.js';
import type { PointerCapture } from '../pointer.js';
export declare class SphereIntersector implements Intersector {
    private readonly space;
    private readonly getSphereRadius;
    private readonly options;
    private readonly fromPosition;
    private readonly fromQuaternion;
    private readonly collisionSphere;
    private ready?;
    private readonly intersects;
    constructor(space: {
        current?: Object3D | null;
    }, getSphereRadius: () => number, options: IntersectionOptions);
    isReady(): boolean;
    private prepareTransformation;
    intersectPointerCapture({ intersection, object }: PointerCapture): Intersection;
    startIntersection(): void;
    executeIntersection(object: Object3D): void;
    finalizeIntersection(scene: Object3D): Intersection;
}
declare module 'three' {
    interface Object3D {
        spherecast?(sphere: Sphere, intersects: Array<ThreeIntersection>): void;
    }
}
