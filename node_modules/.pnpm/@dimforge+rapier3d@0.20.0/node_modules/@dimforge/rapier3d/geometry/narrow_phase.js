import { RawNarrowPhase } from "../raw";
import { VectorOps, scratchBuffer } from "../math";
/**
 * The narrow-phase used for precise collision-detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `narrowPhase.free()`
 * once you are done using it.
 */
export class NarrowPhase {
    /**
     * Release the WASM memory occupied by this narrow-phase.
     */
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }
    constructor(raw) {
        this.raw = raw || new RawNarrowPhase();
        this.tempManifold = new TempContactManifold(null);
    }
    /**
     * Enumerates all the colliders potentially in contact with the given collider.
     *
     * @param collider1 - The second collider involved in the contact.
     * @param f - Closure that will be called on each collider that is in contact with `collider1`.
     */
    contactPairsWith(collider1, f) {
        this.raw.contact_pairs_with(collider1, f);
    }
    /**
     * Enumerates all the colliders intersecting the given colliders, assuming one of them
     * is a sensor.
     */
    intersectionPairsWith(collider1, f) {
        this.raw.intersection_pairs_with(collider1, f);
    }
    /**
     * Iterates through all the contact manifolds between the given pair of colliders.
     *
     * @param collider1 - The first collider involved in the contact.
     * @param collider2 - The second collider involved in the contact.
     * @param bodies - The set of rigid-bodies the colliders are attached to. Solver contacts are
     *                 anchored in body-local space, so this is needed to read them back in world-space.
     * @param f - Closure that will be called on each contact manifold between the two colliders. If the second argument
     *            passed to this closure is `true`, then the contact manifold data is flipped, i.e., methods like `localNormal1`
     *            actually apply to the `collider2` and fields like `localNormal2` apply to the `collider1`.
     */
    contactPair(collider1, collider2, bodies, f) {
        const rawPair = this.raw.contact_pair(collider1, collider2);
        if (!!rawPair) {
            const flipped = rawPair.collider1() != collider1;
            let i;
            for (i = 0; i < rawPair.numContactManifolds(); ++i) {
                this.tempManifold.bodies = bodies;
                this.tempManifold.raw = rawPair.contactManifold(i);
                if (!!this.tempManifold.raw) {
                    f(this.tempManifold, flipped);
                }
                // SAFETY: The RawContactManifold stores a raw pointer that will be invalidated
                //         at the next timestep. So we must be sure to free the pair here
                //         to avoid unsoundness in the Rust code.
                this.tempManifold.free();
            }
            rawPair.free();
        }
    }
    /**
     * Returns `true` if `collider1` and `collider2` intersect and at least one of them is a sensor.
     * @param collider1 − The first collider involved in the intersection.
     * @param collider2 − The second collider involved in the intersection.
     */
    intersectionPair(collider1, collider2) {
        return this.raw.intersection_pair(collider1, collider2);
    }
}
export class TempContactManifold {
    free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }
    constructor(raw, bodies) {
        this.raw = raw;
        this.bodies = bodies;
    }
    /**
     * The contact normal of the manifold, expressed in world-space.
     *
     * @param {Vector?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    normal(target) {
        this.raw.normal(scratchBuffer);
        return VectorOps.fromBuffer(scratchBuffer, target);
    }
    /**
     * The contact normal of the manifold, expressed in the local-space of the first shape.
     *
     * @param {Vector?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    localNormal1(target) {
        this.raw.local_n1(scratchBuffer);
        return VectorOps.fromBuffer(scratchBuffer, target);
    }
    /**
     * The contact normal of the manifold, expressed in the local-space of the second shape.
     *
     * @param {Vector?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    localNormal2(target) {
        this.raw.local_n2(scratchBuffer);
        return VectorOps.fromBuffer(scratchBuffer, target);
    }
    subshape1() {
        return this.raw.subshape1();
    }
    subshape2() {
        return this.raw.subshape2();
    }
    numContacts() {
        return this.raw.num_contacts();
    }
    /**
     * The local-space contact point on the first shape, for the `i`-th contact.
     *
     * @param {number} i - The index of the contact to read.
     * @param {Vector?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    localContactPoint1(i, target) {
        const exists = this.raw.contact_local_p1(i, scratchBuffer);
        return exists ? VectorOps.fromBuffer(scratchBuffer, target) : null;
    }
    /**
     * The local-space contact point on the second shape, for the `i`-th contact.
     *
     * @param {number} i - The index of the contact to read.
     * @param {Vector?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    localContactPoint2(i, target) {
        const exists = this.raw.contact_local_p2(i, scratchBuffer);
        return exists ? VectorOps.fromBuffer(scratchBuffer, target) : null;
    }
    contactDist(i) {
        return this.raw.contact_dist(i);
    }
    contactFid1(i) {
        return this.raw.contact_fid1(i);
    }
    contactFid2(i) {
        return this.raw.contact_fid2(i);
    }
    contactImpulse(i) {
        return this.raw.contact_impulse(i);
    }
    // #if DIM3
    contactTangentImpulseX(i) {
        return this.raw.contact_tangent_impulse_x(i);
    }
    contactTangentImpulseY(i) {
        return this.raw.contact_tangent_impulse_y(i);
    }
    // #endif
    numSolverContacts() {
        return this.raw.num_solver_contacts();
    }
    /**
     * The world-space position of the `i`-th solver contact point.
     *
     * @param {number} i - The index of the solver contact to read.
     * @param {Vector?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    solverContactPoint(i, target) {
        const exists = this.raw.solver_contact_point(this.bodies.raw, i, scratchBuffer);
        return exists ? VectorOps.fromBuffer(scratchBuffer, target) : null;
    }
    solverContactDist(i) {
        return this.raw.solver_contact_dist(i);
    }
    /**
     * The friction coefficient applied to this manifold's solver contacts. It is combined
     * once per manifold, so every solver contact of this manifold shares it.
     */
    friction() {
        return this.raw.friction();
    }
    /**
     * The restitution coefficient applied to this manifold's solver contacts. It is
     * combined once per manifold, so every solver contact of this manifold shares it.
     */
    restitution() {
        return this.raw.restitution();
    }
    /**
     * The tangent (surface) velocity of the `i`-th solver contact point.
     *
     * @param {number} i - The index of the solver contact to read.
     * @param {Vector?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    solverContactTangentVelocity(i, target) {
        this.raw.solver_contact_tangent_velocity(i, scratchBuffer);
        return VectorOps.fromBuffer(scratchBuffer, target);
    }
}
//# sourceMappingURL=narrow_phase.js.map