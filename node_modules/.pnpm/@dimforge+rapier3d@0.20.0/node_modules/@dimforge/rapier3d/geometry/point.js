import { VectorOps, scratchBuffer } from "../math";
import { FeatureType } from "./feature";
/**
 * The projection of a point on a collider.
 */
export class PointProjection {
    constructor(point, isInside) {
        this.point = point;
        this.isInside = isInside;
    }
    /**
     * @param raw - The raw projection returned by the WASM query. It is freed by this method.
     * @param target - If provided, this object is populated and returned instead of
     * allocating a new one.
     */
    static fromBuffer(raw, target) {
        if (!raw)
            return null;
        raw.point(scratchBuffer);
        target !== null && target !== void 0 ? target : (target = new PointProjection(VectorOps.zeros(), false));
        target.point = VectorOps.fromBuffer(scratchBuffer, target.point);
        target.isInside = raw.isInside();
        raw.free();
        return target;
    }
}
/**
 * The projection of a point on a collider (includes the collider handle).
 */
export class PointColliderProjection {
    constructor(collider, point, isInside, featureType, featureId) {
        /**
         * The type of the geometric feature the point was projected on.
         */
        this.featureType = FeatureType.Unknown;
        /**
         * The id of the geometric feature the point was projected on.
         */
        this.featureId = undefined;
        this.collider = collider;
        this.point = point;
        this.isInside = isInside;
        if (featureId !== undefined)
            this.featureId = featureId;
        if (featureType !== undefined)
            this.featureType = featureType;
    }
    /**
     * @param colliderSet - The set the projected-on collider belongs to.
     * @param raw - The raw projection returned by the WASM query. It is freed by this method.
     * @param target - If provided, this object is populated and returned instead of
     * allocating a new one.
     */
    static fromBuffer(colliderSet, raw, target) {
        if (!raw)
            return null;
        raw.point(scratchBuffer);
        target !== null && target !== void 0 ? target : (target = new PointColliderProjection(null, VectorOps.zeros(), false));
        target.collider = colliderSet.get(raw.colliderHandle());
        target.point = VectorOps.fromBuffer(scratchBuffer, target.point);
        target.isInside = raw.isInside();
        target.featureType = raw.featureType();
        target.featureId = raw.featureId();
        raw.free();
        return target;
    }
}
//# sourceMappingURL=point.js.map