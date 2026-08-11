import { Line } from './line';
import { Point, PointOptions, PointLike } from './point';
import { Rectangle } from './rectangle';
import { Geometry } from './geometry';
interface EllipseLike extends PointLike {
    x: number;
    y: number;
    a: number;
    b: number;
}
type EllipseData = [number, number, number, number];
export declare class Ellipse extends Geometry implements EllipseLike {
    static isEllipse(instance: any): instance is Ellipse;
    static create(x?: number | Ellipse | EllipseLike | EllipseData, y?: number, a?: number, b?: number): Ellipse;
    static parse(e: Ellipse | EllipseLike | EllipseData): Ellipse;
    static fromRect(rect: Rectangle): Ellipse;
    x: number;
    y: number;
    a: number;
    b: number;
    get center(): Point;
    constructor(x?: number, y?: number, a?: number, b?: number);
    /**
     * Returns a rectangle that is the bounding box of the ellipse.
     */
    bbox(): Rectangle;
    /**
     * Returns a point that is the center of the ellipse.
     */
    getCenter(): Point;
    /**
     * Returns ellipse inflated in axis-x by `2 * amount` and in axis-y by
     * `2 * amount`.
     */
    inflate(amount: number): this;
    /**
     * Returns ellipse inflated in axis-x by `2 * dx` and in axis-y by `2 * dy`.
     */
    inflate(dx: number, dy: number): this;
    /**
     * Returns a normalized distance from the ellipse center to point `p`.
     * Returns `n < 1` for points inside the ellipse, `n = 1` for points
     * lying on the ellipse boundary and `n > 1` for points outside the ellipse.
     */
    normalizedDistance(x: number, y: number): number;
    normalizedDistance(p: PointOptions): number;
    /**
     * Returns `true` if the point `p` is inside the ellipse (inclusive).
     * Returns `false` otherwise.
     */
    containsPoint(x: number, y: number): boolean;
    containsPoint(p: PointOptions): boolean;
    /**
     * Returns an array of the intersection points of the ellipse and the line.
     * Returns `null` if no intersection exists.
     */
    intersectsWithLine(line: Line): any[];
    /**
     * Returns the point on the boundary of the ellipse that is the
     * intersection of the ellipse with a line starting in the center
     * of the ellipse ending in the point `p`.
     *
     * If angle is specified, the intersection will take into account
     * the rotation of the ellipse by angle degrees around its center.
     */
    intersectsWithLineFromCenterToPoint(p: PointOptions, angle?: number): any;
    /**
     * Returns the angle between the x-axis and the tangent from a point. It is
     * valid for points lying on the ellipse boundary only.
     */
    tangentTheta(p: PointOptions): number;
    scale(sx: number, sy: number): this;
    rotate(angle: number, origin?: PointOptions): this;
    translate(dx: number, dy: number): this;
    translate(p: PointOptions): this;
    equals(ellipse: Ellipse): boolean;
    clone(): Ellipse;
    toJSON(): {
        x: number;
        y: number;
        a: number;
        b: number;
    };
    serialize(): string;
}
export {};
