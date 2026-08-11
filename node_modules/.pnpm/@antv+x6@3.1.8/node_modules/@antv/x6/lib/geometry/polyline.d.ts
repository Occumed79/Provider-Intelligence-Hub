import { Line } from './line';
import { Point, PointOptions } from './point';
import { Rectangle } from './rectangle';
import { Geometry } from './geometry';
export declare class Polyline extends Geometry {
    static isPolyline(instance: any): instance is Polyline;
    static parse(svgString: string): Polyline;
    points: Point[];
    get start(): Point;
    get end(): Point;
    constructor(points?: PointOptions[] | string);
    scale(sx: number, sy: number, origin?: PointOptions): this;
    rotate(angle: number, origin?: PointOptions): this;
    translate(dx: number, dy: number): this;
    translate(p: PointOptions): this;
    round(precision?: number): this;
    bbox(): Rectangle;
    closestPoint(p: PointOptions): Point;
    closestPointLength(p: PointOptions): number;
    closestPointNormalizedLength(p: PointOptions): number;
    closestPointTangent(p: PointOptions): any;
    containsPoint(p: PointOptions): boolean;
    intersectsWithLine(line: Line): any[];
    isDifferentiable(): boolean;
    length(): number;
    pointAt(ratio: number): Point;
    pointAtLength(length: number): Point;
    tangentAt(ratio: number): any;
    tangentAtLength(length: number): any;
    simplify(options?: {
        /**
         * The max distance of middle point from chord to be simplified.
         */
        threshold?: number;
    }): this;
    toHull(): Polyline;
    equals(p: Polyline): boolean;
    clone(): Polyline;
    toJSON(): {
        x: number;
        y: number;
    }[];
    serialize(): string;
}
