import { VectorOps, RotationOps, scratchBuffer } from "../math";
import { RawGenericJoint, RawJointAxis, RawJointType, } from "../raw";
/**
 * An enum grouping all possible types of joints:
 *
 * - `Revolute`: A revolute joint that removes all degrees of freedom between the affected
 *               bodies except for the rotation along one axis.
 * - `Fixed`: A fixed joint that removes all relative degrees of freedom between the affected bodies.
 * - `Prismatic`: A prismatic joint that removes all degrees of freedom between the affected
 *                bodies except for the translation along one axis.
 * - `Spherical`: (3D only) A spherical joint that removes all relative linear degrees of freedom between the affected bodies.
 * - `Generic`: (3D only) A joint with customizable degrees of freedom, allowing any of the 6 axes to be locked.
 */
export var JointType;
(function (JointType) {
    JointType[JointType["Revolute"] = 0] = "Revolute";
    JointType[JointType["Fixed"] = 1] = "Fixed";
    JointType[JointType["Prismatic"] = 2] = "Prismatic";
    JointType[JointType["Rope"] = 3] = "Rope";
    JointType[JointType["Spring"] = 4] = "Spring";
    // #if DIM3
    JointType[JointType["Spherical"] = 5] = "Spherical";
    JointType[JointType["Generic"] = 6] = "Generic";
    // #endif
})(JointType || (JointType = {}));
export var MotorModel;
(function (MotorModel) {
    MotorModel[MotorModel["AccelerationBased"] = 0] = "AccelerationBased";
    MotorModel[MotorModel["ForceBased"] = 1] = "ForceBased";
})(MotorModel || (MotorModel = {}));
/**
 * An enum representing a single joint axis, used to configure per-axis joint
 * properties like the motors of a spherical joint.
 */
// #if DIM3
export var JointAxis;
(function (JointAxis) {
    JointAxis[JointAxis["LinX"] = 0] = "LinX";
    JointAxis[JointAxis["LinY"] = 1] = "LinY";
    JointAxis[JointAxis["LinZ"] = 2] = "LinZ";
    JointAxis[JointAxis["AngX"] = 3] = "AngX";
    JointAxis[JointAxis["AngY"] = 4] = "AngY";
    JointAxis[JointAxis["AngZ"] = 5] = "AngZ";
})(JointAxis || (JointAxis = {}));
// #endif
/**
 * An enum representing the possible joint axes of a generic joint.
 * They can be ORed together, like:
 * JointAxesMask.LinX || JointAxesMask.LinY
 * to get a joint that is only free in the X and Y translational (positional) axes.
 *
 * Possible free axes are:
 *
 * - `X`: X translation axis
 * - `Y`: Y translation axis
 * - `Z`: Z translation axis
 * - `AngX`: X angular rotation axis
 * - `AngY`: Y angular rotations axis
 * - `AngZ`: Z angular rotation axis
 */
export var JointAxesMask;
(function (JointAxesMask) {
    JointAxesMask[JointAxesMask["LinX"] = 1] = "LinX";
    JointAxesMask[JointAxesMask["LinY"] = 2] = "LinY";
    JointAxesMask[JointAxesMask["LinZ"] = 4] = "LinZ";
    JointAxesMask[JointAxesMask["AngX"] = 8] = "AngX";
    JointAxesMask[JointAxesMask["AngY"] = 16] = "AngY";
    JointAxesMask[JointAxesMask["AngZ"] = 32] = "AngZ";
})(JointAxesMask || (JointAxesMask = {}));
export class ImpulseJoint {
    constructor(rawSet, bodySet, handle) {
        this.rawSet = rawSet;
        this.bodySet = bodySet;
        this.handle = handle;
    }
    static newTyped(rawSet, bodySet, handle) {
        switch (rawSet.jointType(handle)) {
            case RawJointType.Revolute:
                return new RevoluteImpulseJoint(rawSet, bodySet, handle);
            case RawJointType.Prismatic:
                return new PrismaticImpulseJoint(rawSet, bodySet, handle);
            case RawJointType.Fixed:
                return new FixedImpulseJoint(rawSet, bodySet, handle);
            case RawJointType.Spring:
                return new SpringImpulseJoint(rawSet, bodySet, handle);
            case RawJointType.Rope:
                return new RopeImpulseJoint(rawSet, bodySet, handle);
            // #if DIM3
            case RawJointType.Spherical:
                return new SphericalImpulseJoint(rawSet, bodySet, handle);
            case RawJointType.Generic:
                return new GenericImpulseJoint(rawSet, bodySet, handle);
            // #endif
            default:
                return new ImpulseJoint(rawSet, bodySet, handle);
        }
    }
    /** @internal */
    finalizeDeserialization(bodySet) {
        this.bodySet = bodySet;
    }
    /**
     * Checks if this joint is still valid (i.e. that it has
     * not been deleted from the joint set yet).
     */
    isValid() {
        return this.rawSet.contains(this.handle);
    }
    /**
     * The first rigid-body this joint it attached to.
     */
    body1() {
        return this.bodySet.get(this.rawSet.jointBodyHandle1(this.handle));
    }
    /**
     * The second rigid-body this joint is attached to.
     */
    body2() {
        return this.bodySet.get(this.rawSet.jointBodyHandle2(this.handle));
    }
    /**
     * The type of this joint given as a string.
     */
    type() {
        return this.rawSet.jointType(this.handle);
    }
    // #if DIM3
    /**
     * The rotation quaternion that aligns this joint's first local axis to the `x` axis.
     *
     * @param {Rotation?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    frameX1(target) {
        this.rawSet.jointFrameX1(this.handle, scratchBuffer);
        return RotationOps.fromBuffer(scratchBuffer, target);
    }
    // #endif
    // #if DIM3
    /**
     * The rotation matrix that aligns this joint's second local axis to the `x` axis.
     *
     * @param {Rotation?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    frameX2(target) {
        this.rawSet.jointFrameX2(this.handle, scratchBuffer);
        return RotationOps.fromBuffer(scratchBuffer, target);
    }
    // #endif
    /**
     * The position of the first anchor of this joint.
     *
     * The first anchor gives the position of the application point on the
     * local frame of the first rigid-body it is attached to.
     *
     * @param {Vector?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    anchor1(target) {
        this.rawSet.jointAnchor1(this.handle, scratchBuffer);
        return VectorOps.fromBuffer(scratchBuffer, target);
    }
    /**
     * The position of the second anchor of this joint.
     *
     * The second anchor gives the position of the application point on the
     * local frame of the second rigid-body it is attached to.
     *
     * @param {Vector?} target - The object to be populated. If provided,
     * the function returns this object instead of creating a new one.
     */
    anchor2(target) {
        this.rawSet.jointAnchor2(this.handle, scratchBuffer);
        return VectorOps.fromBuffer(scratchBuffer, target);
    }
    /**
     * Sets the position of the first anchor of this joint.
     *
     * The first anchor gives the position of the application point on the
     * local frame of the first rigid-body it is attached to.
     */
    setAnchor1(newPos) {
        const rawPoint = VectorOps.intoRaw(newPos);
        this.rawSet.jointSetAnchor1(this.handle, rawPoint);
        rawPoint.free();
    }
    /**
     * Sets the position of the second anchor of this joint.
     *
     * The second anchor gives the position of the application point on the
     * local frame of the second rigid-body it is attached to.
     */
    setAnchor2(newPos) {
        const rawPoint = VectorOps.intoRaw(newPos);
        this.rawSet.jointSetAnchor2(this.handle, rawPoint);
        rawPoint.free();
    }
    // #if DIM3
    /**
     * Sets the rotation quaternion that aligns this joint's first local axis to the `x` axis.
     */
    setFrameX1(rot) {
        const rawRot = RotationOps.intoRaw(rot);
        this.rawSet.jointSetFrameX1(this.handle, rawRot);
        rawRot.free();
    }
    /**
     * Sets the rotation quaternion that aligns this joint's second local axis to the `x` axis.
     */
    setFrameX2(rot) {
        const rawRot = RotationOps.intoRaw(rot);
        this.rawSet.jointSetFrameX2(this.handle, rawRot);
        rawRot.free();
    }
    /**
     * Sets the full local frame (anchor position and rotation) for the first rigid-body attachment.
     */
    setLocalFrame1(anchor, rot) {
        const rawAnchor = VectorOps.intoRaw(anchor);
        const rawRot = RotationOps.intoRaw(rot);
        this.rawSet.jointSetLocalFrame1(this.handle, rawAnchor, rawRot);
        rawAnchor.free();
        rawRot.free();
    }
    /**
     * Sets the full local frame (anchor position and rotation) for the second rigid-body attachment.
     */
    setLocalFrame2(anchor, rot) {
        const rawAnchor = VectorOps.intoRaw(anchor);
        const rawRot = RotationOps.intoRaw(rot);
        this.rawSet.jointSetLocalFrame2(this.handle, rawAnchor, rawRot);
        rawAnchor.free();
        rawRot.free();
    }
    // #endif
    /**
     * Controls whether contacts are computed between colliders attached
     * to the rigid-bodies linked by this joint.
     */
    setContactsEnabled(enabled) {
        this.rawSet.jointSetContactsEnabled(this.handle, enabled);
    }
    /**
     * Indicates if contacts are enabled between colliders attached
     * to the rigid-bodies linked by this joint.
     */
    contactsEnabled() {
        return this.rawSet.jointContactsEnabled(this.handle);
    }
}
export class UnitImpulseJoint extends ImpulseJoint {
    /**
     * Are the limits enabled for this joint?
     */
    limitsEnabled() {
        return this.rawSet.jointLimitsEnabled(this.handle, this.rawAxis());
    }
    /**
     * The min limit of this joint.
     */
    limitsMin() {
        return this.rawSet.jointLimitsMin(this.handle, this.rawAxis());
    }
    /**
     * The max limit of this joint.
     */
    limitsMax() {
        return this.rawSet.jointLimitsMax(this.handle, this.rawAxis());
    }
    /**
     * Sets the limits of this joint.
     *
     * @param min - The minimum bound of this joint’s free coordinate.
     * @param max - The maximum bound of this joint’s free coordinate.
     */
    setLimits(min, max) {
        this.rawSet.jointSetLimits(this.handle, this.rawAxis(), min, max);
    }
    configureMotorModel(model) {
        this.rawSet.jointConfigureMotorModel(this.handle, this.rawAxis(), model);
    }
    setMotorMaxForce(maxForce) {
        this.rawSet.jointSetMotorMaxForce(this.handle, this.rawAxis(), maxForce);
    }
    configureMotorVelocity(targetVel, factor) {
        this.rawSet.jointConfigureMotorVelocity(this.handle, this.rawAxis(), targetVel, factor);
    }
    configureMotorPosition(targetPos, stiffness, damping) {
        this.rawSet.jointConfigureMotorPosition(this.handle, this.rawAxis(), targetPos, stiffness, damping);
    }
    configureMotor(targetPos, targetVel, stiffness, damping) {
        this.rawSet.jointConfigureMotor(this.handle, this.rawAxis(), targetPos, targetVel, stiffness, damping);
    }
}
export class FixedImpulseJoint extends ImpulseJoint {
}
export class RopeImpulseJoint extends ImpulseJoint {
}
export class SpringImpulseJoint extends ImpulseJoint {
}
export class PrismaticImpulseJoint extends UnitImpulseJoint {
    rawAxis() {
        return RawJointAxis.LinX;
    }
}
export class RevoluteImpulseJoint extends UnitImpulseJoint {
    rawAxis() {
        return RawJointAxis.AngX;
    }
}
// #if DIM3
export class GenericImpulseJoint extends ImpulseJoint {
}
export class SphericalImpulseJoint extends ImpulseJoint {
    /**
     * Sets the motor model of one of this joint's angular axes.
     *
     * @param axis - The angular axis (`JointAxis.AngX/AngY/AngZ`) to configure.
     * @param model - The motor model to apply to that axis.
     */
    configureMotorModel(axis, model) {
        this.rawSet.jointConfigureMotorModel(this.handle, axis, model);
    }
    /**
     * Sets the maximum force/torque the motor of the given angular axis can deliver.
     *
     * @param axis - The angular axis (`JointAxis.AngX/AngY/AngZ`) to configure.
     * @param maxForce - The maximum torque the axis motor can deliver.
     */
    setMotorMaxForce(axis, maxForce) {
        this.rawSet.jointSetMotorMaxForce(this.handle, axis, maxForce);
    }
    /**
     * Makes the motor of the given angular axis target a specific angular velocity.
     *
     * @param axis - The angular axis (`JointAxis.AngX/AngY/AngZ`) to configure.
     * @param targetVel - The target angular velocity along the axis, in radians per second.
     * @param factor - The strength used to reach the target velocity (a damping coefficient).
     */
    configureMotorVelocity(axis, targetVel, factor) {
        this.rawSet.jointConfigureMotorVelocity(this.handle, axis, targetVel, factor);
    }
    /**
     * Makes the motor of the given angular axis target a specific angle.
     *
     * @param axis - The angular axis (`JointAxis.AngX/AngY/AngZ`) to configure.
     * @param targetPos - The target angle along the axis, in radians.
     * @param stiffness - The spring-like stiffness used to reach the target angle.
     * @param damping - The damping applied to the axis' angular velocity.
     */
    configureMotorPosition(axis, targetPos, stiffness, damping) {
        this.rawSet.jointConfigureMotorPosition(this.handle, axis, targetPos, stiffness, damping);
    }
    /**
     * Configures the motor of the given angular axis with both an angle and an
     * angular-velocity target.
     *
     * @param axis - The angular axis (`JointAxis.AngX/AngY/AngZ`) to configure.
     * @param targetPos - The target angle along the axis, in radians.
     * @param targetVel - The target angular velocity along the axis, in radians per second.
     * @param stiffness - The spring-like stiffness used to reach the target angle.
     * @param damping - The damping applied to the axis' angular velocity.
     */
    configureMotor(axis, targetPos, targetVel, stiffness, damping) {
        this.rawSet.jointConfigureMotor(this.handle, axis, targetPos, targetVel, stiffness, damping);
    }
}
// #endif
export class JointData {
    constructor() { }
    /**
     * Creates a new joint descriptor that builds a Fixed joint.
     *
     * A fixed joint removes all the degrees of freedom between the affected bodies, ensuring their
     * anchor and local frames coincide in world-space.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param frame1 - The reference orientation of the joint wrt. the first rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param frame2 - The reference orientation of the joint wrt. the second rigid-body.
     */
    static fixed(anchor1, frame1, anchor2, frame2) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.frame1 = frame1;
        res.frame2 = frame2;
        res.jointType = JointType.Fixed;
        return res;
    }
    static spring(rest_length, stiffness, damping, anchor1, anchor2) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.length = rest_length;
        res.stiffness = stiffness;
        res.damping = damping;
        res.jointType = JointType.Spring;
        return res;
    }
    static rope(length, anchor1, anchor2) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.length = length;
        res.jointType = JointType.Rope;
        return res;
    }
    // #if DIM3
    /**
     * Create a new joint descriptor that builds generic joints.
     *
     * A generic joint allows customizing its degrees of freedom
     * by supplying a mask of the joint axes that should remain locked.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis - The X axis of the joint, expressed in the local-space of the rigid-bodies it is attached to.
     * @param axesMask - Mask representing the locked axes of the joint. You can use logical OR to select these from
     *                   the JointAxesMask enum. For example, passing (JointAxesMask.AngX || JointAxesMask.AngY) will
     *                   create a joint locked in the X and Y rotational axes.
     */
    static generic(anchor1, anchor2, axis, axesMask) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis = axis;
        res.axesMask = axesMask;
        res.jointType = JointType.Generic;
        return res;
    }
    /**
     * Create a new joint descriptor that builds spherical joints.
     *
     * A spherical joint allows three relative rotational degrees of freedom
     * by preventing any relative translation between the anchors of the
     * two attached rigid-bodies.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     */
    static spherical(anchor1, anchor2) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.jointType = JointType.Spherical;
        return res;
    }
    /**
     * Creates a new joint descriptor that builds a Prismatic joint.
     *
     * A prismatic joint removes all the degrees of freedom between the
     * affected bodies, except for the translation along one axis.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis - Axis of the joint, expressed in the local-space of the rigid-bodies it is attached to.
     */
    static prismatic(anchor1, anchor2, axis) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis = axis;
        res.jointType = JointType.Prismatic;
        return res;
    }
    /**
     * Create a new joint descriptor that builds Revolute joints.
     *
     * A revolute joint removes all degrees of freedom between the affected
     * bodies except for the rotation along one axis.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis - Axis of the joint, expressed in the local-space of the rigid-bodies it is attached to.
     */
    static revolute(anchor1, anchor2, axis) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis = axis;
        res.jointType = JointType.Revolute;
        return res;
    }
    /**
     * Create a new joint descriptor that builds Revolute joints with independent
     * local axes for each attached rigid-body.
     *
     * This is useful when the same world-space hinge axis is represented by
     * different local axes on the two bodies.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis1 - Axis of the joint, expressed in the local-space of the first rigid-body.
     * @param axis2 - Axis of the joint, expressed in the local-space of the second rigid-body.
     */
    static revoluteWithAxes(anchor1, anchor2, axis1, axis2) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis = axis1;
        res.axis1 = axis1;
        res.axis2 = axis2;
        res.jointType = JointType.Revolute;
        return res;
    }
    // #endif
    intoRaw() {
        let rawA1 = VectorOps.intoRaw(this.anchor1);
        let rawA2 = VectorOps.intoRaw(this.anchor2);
        let rawAx;
        let result;
        let limitsEnabled = false;
        let limitsMin = 0.0;
        let limitsMax = 0.0;
        switch (this.jointType) {
            case JointType.Fixed:
                let rawFra1 = RotationOps.intoRaw(this.frame1);
                let rawFra2 = RotationOps.intoRaw(this.frame2);
                result = RawGenericJoint.fixed(rawA1, rawFra1, rawA2, rawFra2);
                rawFra1.free();
                rawFra2.free();
                break;
            case JointType.Spring:
                result = RawGenericJoint.spring(this.length, this.stiffness, this.damping, rawA1, rawA2);
                break;
            case JointType.Rope:
                result = RawGenericJoint.rope(this.length, rawA1, rawA2);
                break;
            case JointType.Prismatic:
                rawAx = VectorOps.intoRaw(this.axis);
                if (!!this.limitsEnabled) {
                    limitsEnabled = true;
                    limitsMin = this.limits[0];
                    limitsMax = this.limits[1];
                }
                // #if DIM3
                result = RawGenericJoint.prismatic(rawA1, rawA2, rawAx, limitsEnabled, limitsMin, limitsMax);
                // #endif
                rawAx.free();
                break;
            // #if DIM3
            case JointType.Generic:
                rawAx = VectorOps.intoRaw(this.axis);
                // implicit type cast: axesMask is a JointAxesMask bitflag enum,
                // we're treating it as a u8 on the Rust side
                let rawAxesMask = this.axesMask;
                result = RawGenericJoint.generic(rawA1, rawA2, rawAx, rawAxesMask);
                break;
            case JointType.Spherical:
                result = RawGenericJoint.spherical(rawA1, rawA2);
                break;
            case JointType.Revolute:
                if (!!this.axis1 && !!this.axis2) {
                    let rawAx1 = VectorOps.intoRaw(this.axis1);
                    let rawAx2 = VectorOps.intoRaw(this.axis2);
                    result = RawGenericJoint.revoluteWithAxes(rawA1, rawA2, rawAx1, rawAx2);
                    rawAx1.free();
                    rawAx2.free();
                }
                else {
                    rawAx = VectorOps.intoRaw(this.axis);
                    result = RawGenericJoint.revolute(rawA1, rawA2, rawAx);
                    rawAx.free();
                }
                break;
            // #endif
        }
        rawA1.free();
        rawA2.free();
        return result;
    }
}
//# sourceMappingURL=impulse_joint.js.map