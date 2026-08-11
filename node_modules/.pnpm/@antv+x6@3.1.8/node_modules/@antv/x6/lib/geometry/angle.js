"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRad = void 0;
exports.toDeg = toDeg;
exports.normalize = normalize;
/**
 * Converts radian angle to degree angle.
 * @param rad The radians to convert.
 */
function toDeg(rad) {
    return ((180 * rad) / Math.PI) % 360;
}
/**
 * Converts degree angle to radian angle.
 * @param deg The degree angle to convert.
 * @param over360
 */
const toRad = function (deg, over360 = false) {
    const d = over360 ? deg : deg % 360;
    return (d * Math.PI) / 180;
};
exports.toRad = toRad;
/**
 * Returns the angle in degrees and clamps its value between `0` and `360`.
 */
function normalize(angle) {
    return (angle % 360) + (angle < 0 ? 360 : 0);
}
//# sourceMappingURL=angle.js.map