import { Mesh, Object3D, Vector2, Vector3 } from 'three';
export declare function updateAndCheckWorldTransformation(object: Object3D): boolean;
/**
 * @requires that `mesh.updateWorldMatrix(true, false)` was executed beforehand
 */
export declare function getClosestUV(target: Vector2, point: Vector3, mesh: Mesh): boolean;
