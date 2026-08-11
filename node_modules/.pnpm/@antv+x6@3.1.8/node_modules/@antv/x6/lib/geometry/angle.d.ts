/**
 * Converts radian angle to degree angle.
 * @param rad The radians to convert.
 */
export declare function toDeg(rad: number): number;
/**
 * Converts degree angle to radian angle.
 * @param deg The degree angle to convert.
 * @param over360
 */
export declare const toRad: (deg: number, over360?: boolean) => number;
/**
 * Returns the angle in degrees and clamps its value between `0` and `360`.
 */
export declare function normalize(angle: number): number;
