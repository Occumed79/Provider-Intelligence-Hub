import { Object3D } from 'three';
import { Intersection } from '../index.js';
import { PointerCapture } from '../pointer.js';
export declare function getVoidObject(scene: Object3D): Object3D;
export interface Intersector {
    intersectPointerCapture(pointerCapture: PointerCapture, nativeEvent: unknown): Intersection;
    isReady(): boolean;
    startIntersection(nativeEvent: unknown): void;
    executeIntersection(scene: Object3D, objectPointerEventsOrder: number): void;
    finalizeIntersection(scene: Object3D): Intersection;
}
