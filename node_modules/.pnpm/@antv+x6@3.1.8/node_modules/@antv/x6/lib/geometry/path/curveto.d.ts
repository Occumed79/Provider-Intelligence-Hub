import { Curve } from '../curve';
import { Point, PointOptions } from '../point';
import { Segment, SegmentOptions } from './segment';
export declare class CurveTo extends Segment {
    static create(x1: number, y1: number, x2: number, y2: number, x: number, y: number): CurveTo;
    static create(x1: number, y1: number, x2: number, y2: number, x: number, y: number, ...coords: number[]): CurveTo[];
    static create(c1: PointOptions, c2: PointOptions, p: PointOptions): CurveTo;
    static create(c1: PointOptions, c2: PointOptions, p: PointOptions, ...points: PointOptions[]): CurveTo[];
    controlPoint1: Point;
    controlPoint2: Point;
    constructor(curve: Curve);
    constructor(x1: number, y1: number, x2: number, y2: number, x: number, y: number);
    constructor(p1: PointOptions, p2: PointOptions, p3: PointOptions);
    get type(): string;
    get curve(): Curve;
    bbox(): import("..").Rectangle;
    closestPoint(p: PointOptions): Point;
    closestPointLength(p: PointOptions): number;
    closestPointNormalizedLength(p: PointOptions): number;
    closestPointTangent(p: PointOptions): import("..").Line;
    length(): number;
    divideAt(ratio: number, options?: SegmentOptions): [Segment, Segment];
    divideAtLength(length: number, options?: SegmentOptions): [Segment, Segment];
    divideAtT(t: number): [Segment, Segment];
    getSubdivisions(): any[];
    pointAt(ratio: number): Point;
    pointAtLength(length: number): Point;
    tangentAt(ratio: number): import("..").Line;
    tangentAtLength(length: number): import("..").Line;
    isDifferentiable(): boolean;
    scale(sx: number, sy: number, origin?: PointOptions): this;
    rotate(angle: number, origin?: PointOptions): this;
    translate(tx: number, ty: number): this;
    translate(p: PointOptions): this;
    equals(s: Segment): boolean;
    clone(): CurveTo;
    toJSON(): {
        type: string;
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
