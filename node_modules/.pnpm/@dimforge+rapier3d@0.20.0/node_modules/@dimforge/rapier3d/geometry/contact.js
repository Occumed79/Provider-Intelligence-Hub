import { VectorOps, scratchBuffer } from "../math";
/**
 * The contact info between two shapes.
 */
export class ShapeContact {
    constructor(dist, point1, point2, normal1, normal2) {
        this.distance = dist;
        this.point1 = point1;
        this.point2 = point2;
        this.normal1 = normal1;
        this.normal2 = normal2;
    }
    /**
     * @param raw - The raw contact returned by the WASM query. It is freed by this method.
     * @param target - If provided, this object is populated and returned instead of
     * allocating a new one.
     */
    static fromBuffer(raw, target) {
        if (!raw)
            return null;
        raw.getComponents(scratchBuffer);
        raw.free();
        target !== null && target !== void 0 ? target : (target = new ShapeContact(0, VectorOps.zeros(), VectorOps.zeros(), VectorOps.zeros(), VectorOps.zeros()));
        target.distance = scratchBuffer[0];
        // #if DIM3
        target.point1.x = scratchBuffer[1];
        target.point1.y = scratchBuffer[2];
        target.point1.z = scratchBuffer[3];
        target.point2.x = scratchBuffer[4];
        target.point2.y = scratchBuffer[5];
        target.point2.z = scratchBuffer[6];
        target.normal1.x = scratchBuffer[7];
        target.normal1.y = scratchBuffer[8];
        target.normal1.z = scratchBuffer[9];
        target.normal2.x = scratchBuffer[10];
        target.normal2.y = scratchBuffer[11];
        target.normal2.z = scratchBuffer[12];
        // #endif
        return target;
    }
}
//# sourceMappingURL=contact.js.map