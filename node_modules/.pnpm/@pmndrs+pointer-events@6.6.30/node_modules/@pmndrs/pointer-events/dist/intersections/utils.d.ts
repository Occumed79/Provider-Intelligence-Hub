import { Plane, Intersection as ThreeIntersection, Object3D, Vector3, Ray, Quaternion, Matrix4 } from 'three';
import { Intersection, IntersectionOptions } from './index.js';
import { AllowedPointerEventsType, Pointer, type AllowedPointerEvents } from '../pointer.js';
export declare function computeIntersectionWorldPlane(target: Plane, intersection: Intersection, objectMatrixWorld: Matrix4): boolean;
export declare function intersectPointerEventTargets(type: 'wheel' | 'pointer', object: Object3D, pointers: Array<Pointer>, parentHasListener?: boolean, parentPointerEvents?: AllowedPointerEvents, parentPointerEventsType?: AllowedPointerEventsType, parentPointerEventsOrder?: number): void;
/**
 * @returns undefined if `i1` is the dominant intersection
 * @param i2DistanceOffset modifies i2 and adds the i2DistanceOffset to the current distance
 */
export declare function getDominantIntersectionIndex<T extends ThreeIntersection>(intersections: Array<T>, pointerEventsOrders: Array<number | undefined> | undefined, { customSort: compare }?: IntersectionOptions, filter?: (intersection: ThreeIntersection) => boolean): number | undefined;
export declare function voidObjectIntersectionFromRay(scene: Object3D, ray: Ray, getDetails: (pointer: Vector3, distanceOnRay: number) => Intersection['details'], pointerPosition: Vector3, pointerQuaternion: Quaternion, addToDistance?: number): Intersection;
export declare function pushTimes<T>(target: Array<T>, value: T, times: number): void;
