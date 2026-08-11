import { Line } from './line';
import { Point, PointLike, PointOptions } from './point';
import { Geometry } from './geometry';
import { Ellipse } from './ellipse';
export type RectangleData = [number, number, number, number];
export interface RectangleLike extends PointLike {
    x: number;
    y: number;
    width: number;
    height: number;
}
export type Side = 'left' | 'right' | 'top' | 'bottom';
interface Size {
    width: number;
    height: number;
}
export declare class Rectangle extends Geometry implements RectangleLike {
    static isRectangle(instance: any): instance is Rectangle;
    static isRectangleLike(o: any): o is RectangleLike;
    static create(rect: RectangleLike | RectangleData): Rectangle;
    static create(x?: number, y?: number, width?: number, height?: number): Rectangle;
    static create(x?: number | RectangleLike | RectangleData, y?: number, width?: number, height?: number): Rectangle;
    static clone(rect: RectangleLike | RectangleData): Rectangle;
    /**
     * Returns a new rectangle from the given ellipse.
     */
    static fromEllipse(ellipse: Ellipse): Rectangle;
    static fromSize(size: Size): Rectangle;
    static fromPositionAndSize(pos: PointLike, size: Size): Rectangle;
    x: number;
    y: number;
    width: number;
    height: number;
    get left(): number;
    get top(): number;
    get right(): number;
    get bottom(): number;
    get origin(): Point;
    get topLeft(): Point;
    get topCenter(): Point;
    get topRight(): Point;
    get center(): Point;
    get bottomLeft(): Point;
    get bottomCenter(): Point;
    get bottomRight(): Point;
    get corner(): Point;
    get rightMiddle(): Point;
    get leftMiddle(): Point;
    get topLine(): Line;
    get rightLine(): Line;
    get bottomLine(): Line;
    get leftLine(): Line;
    constructor(x?: number, y?: number, width?: number, height?: number);
    getOrigin(): Point;
    getTopLeft(): Point;
    getTopCenter(): Point;
    getTopRight(): Point;
    getCenter(): Point;
    getCenterX(): number;
    getCenterY(): number;
    getBottomLeft(): Point;
    getBottomCenter(): Point;
    getBottomRight(): Point;
    getCorner(): Point;
    getRightMiddle(): Point;
    getLeftMiddle(): Point;
    getTopLine(): Line;
    getRightLine(): Line;
    getBottomLine(): Line;
    getLeftLine(): Line;
    /**
     * Returns a rectangle that is the bounding box of the rectangle.
     *
     * If `angle` is specified, the bounding box calculation will take into
     * account the rotation of the rectangle by angle degrees around its center.
     */
    bbox(angle?: number): Rectangle;
    round(precision?: number): this;
    add(x: number, y: number, width: number, height: number): this;
    add(rect: RectangleLike | RectangleData): this;
    update(x: number, y: number, width: number, height: number): this;
    update(rect: RectangleLike | RectangleData): this;
    inflate(amount: number): this;
    /**
     * Returns a rectangle inflated in axis-x by `2*dx` and in axis-y by `2*dy`.
     */
    inflate(dx: number, dy: number): this;
    /**
     * Adjust the position and dimensions of the rectangle such that its edges
     * are on the nearest increment of `gx` on the x-axis and `gy` on the y-axis.
     */
    snapToGrid(gridSize: number): this;
    snapToGrid(gx: number, gy: number): this;
    snapToGrid(gx: number, gy?: number): this;
    translate(tx: number, ty: number): this;
    translate(p: PointOptions): this;
    scale(sx: number, sy: number, origin?: PointOptions): this;
    rotate(degree: number, center?: PointOptions): this;
    rotate90(): this;
    /**
     * Translates the rectangle by `rect.x` and `rect.y` and expand it by
     * `rect.width` and `rect.height`.
     */
    moveAndExpand(rect: RectangleLike | RectangleData): this;
    /**
     * Returns an object where `sx` and `sy` give the maximum scaling that can be
     * applied to the rectangle so that it would still fit into `limit`. If
     * `origin` is specified, the rectangle is scaled around it; otherwise, it is
     * scaled around its center.
     */
    getMaxScaleToFit(limit: RectangleLike | RectangleData, origin?: Point): {
        sx: number;
        sy: number;
    };
    /**
     * Returns a number that specifies the maximum scaling that can be applied to
     * the rectangle along both axes so that it would still fit into `limit`. If
     * `origin` is specified, the rectangle is scaled around it; otherwise, it is
     * scaled around its center.
     */
    getMaxUniformScaleToFit(limit: RectangleLike | RectangleData, origin?: Point): number;
    /**
     * Returns `true` if the point is inside the rectangle (inclusive).
     * Returns `false` otherwise.
     */
    containsPoint(x: number, y: number): boolean;
    containsPoint(point: PointOptions): boolean;
    /**
     * Returns `true` if the rectangle is (completely) inside the
     * rectangle (inclusive). Returns `false` otherwise.
     */
    containsRect(x: number, y: number, w: number, h: number): boolean;
    containsRect(rect: RectangleLike | RectangleData): boolean;
    /**
     * Returns an array of the intersection points of the rectangle and the line.
     * Return `null` if no intersection exists.
     */
    intersectsWithLine(line: Line): Point[];
    /**
     * Returns the point on the boundary of the rectangle that is the intersection
     * of the rectangle with a line starting in the center the rectangle ending in
     * the point `p`.
     *
     * If `angle` is specified, the intersection will take into account the
     * rotation of the rectangle by `angle` degrees around its center.
     */
    intersectsWithLineFromCenterToPoint(p: PointOptions, angle?: number): Point;
    /**
     * Returns a rectangle that is a subtraction of the two rectangles if such an
     * object exists (the two rectangles intersect). Returns `null` otherwise.
     */
    intersectsWithRect(x: number, y: number, w: number, h: number): Rectangle | null;
    intersectsWithRect(rect: RectangleLike | RectangleData): Rectangle | null;
    isIntersectWithRect(x: number, y: number, w: number, h: number): boolean;
    isIntersectWithRect(rect: RectangleLike | RectangleData): boolean;
    /**
     * Normalize the rectangle, i.e. make it so that it has non-negative
     * width and height. If width is less than `0`, the function swaps left and
     * right corners and if height is less than `0`, the top and bottom corners
     * are swapped.
     */
    normalize(): this;
    /**
     * Returns a rectangle that is a union of this rectangle and rectangle `rect`.
     */
    union(rect: RectangleLike | RectangleData): Rectangle;
    /**
     * Returns a string ("top", "left", "right" or "bottom") denoting the side of
     * the rectangle which is nearest to the point `p`.
     */
    getNearestSideToPoint(p: PointOptions): Side;
    /**
     * Returns a point on the boundary of the rectangle nearest to the point `p`.
     */
    getNearestPointToPoint(p: PointOptions): Point;
    equals(rect: RectangleLike): boolean;
    clone(): Rectangle;
    toJSON(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    serialize(): string;
}
export {};
