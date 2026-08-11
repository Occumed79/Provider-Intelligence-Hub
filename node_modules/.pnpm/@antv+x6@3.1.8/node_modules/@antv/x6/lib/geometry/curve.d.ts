import { Line } from './line';
import { Point, PointOptions } from './point';
import { Polyline } from './polyline';
import { Rectangle } from './rectangle';
import { Geometry } from './geometry';
export declare class Curve extends Geometry {
    static isCurve(instance: any): instance is Curve;
    static throughPoints(points: PointOptions[]): any[];
    start: Point;
    end: Point;
    controlPoint1: Point;
    controlPoint2: Point;
    PRECISION: number;
    constructor(start: PointOptions, controlPoint1: PointOptions, controlPoint2: PointOptions, end: PointOptions);
    bbox(): Rectangle;
    closestPoint(p: PointOptions, options?: CurveOptions): Point;
    closestPointLength(p: PointOptions, options?: CurveOptions): number;
    closestPointNormalizedLength(p: PointOptions, options?: CurveOptions): number;
    closestPointT(p: PointOptions, options?: CurveOptions): number;
    closestPointTangent(p: PointOptions, options?: CurveOptions): Line;
    containsPoint(p: PointOptions, options?: CurveOptions): boolean;
    divideAt(ratio: number, options?: CurveOptions): [Curve, Curve];
    divideAtLength(length: number, options?: CurveOptions): [Curve, Curve];
    divide(t: number): [Curve, Curve];
    divideAtT(t: number): [Curve, Curve];
    endpointDistance(): number;
    getSkeletonPoints(t: number): {
        startControlPoint1: Point;
        startControlPoint2: Point;
        divider: Point;
        dividerControlPoint1: Point;
        dividerControlPoint2: Point;
    };
    getSubdivisions(options?: CurveOptions): Curve[];
    length(options?: CurveOptions): number;
    lengthAtT(t: number, options?: CurveOptions): number;
    pointAt(ratio: number, options?: CurveOptions): Point;
    pointAtLength(length: number, options?: CurveOptions): Point;
    pointAtT(t: number): Point;
    isDifferentiable(): boolean;
    tangentAt(ratio: number, options?: CurveOptions): Line;
    tangentAtLength(length: number, options?: CurveOptions): Line;
    tangentAtT(t: number): Line;
    protected getPrecision(options?: CurveOptions): number;
    protected getDivisions(options?: CurveOptions): Curve[];
    protected getOptions(options?: CurveOptions): CurveOptions;
    protected tAt(ratio: number, options?: CurveOptions): number;
    protected tAtLength(length: number, options?: CurveOptions): number;
    toPoints(options?: CurveOptions): Point[];
    toPolyline(options?: CurveOptions): Polyline;
    scale(sx: number, sy: number, origin?: PointOptions): this;
    rotate(angle: number, origin?: PointOptions): this;
    translate(tx: number, ty: number): this;
    translate(p: PointOptions): this;
    equals(c: Curve): boolean;
    clone(): Curve;
    toJSON(): {
        start: {
            x: number;
            y: number;
        };
        controlPoint1: {
            x: number;
            y: number;
        };
        controlPoint2: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number;
        };
    };
    serialize(): string;
}
export interface CurveOptions {
    precision?: number;
    subdivisions?: Curve[];
}
