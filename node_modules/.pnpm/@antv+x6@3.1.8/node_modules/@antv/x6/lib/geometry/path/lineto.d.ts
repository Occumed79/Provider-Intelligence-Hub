import { Line } from '../line';
import { Point, PointOptions } from '../point';
import { Segment } from './segment';
export declare class LineTo extends Segment {
    static create(line: Line): LineTo;
    static create(point: PointOptions): LineTo;
    static create(x: number, y: number): LineTo;
    static create(point: PointOptions, ...points: PointOptions[]): LineTo[];
    static create(x: number, y: number, ...coords: number[]): LineTo[];
    constructor(line: Line);
    constructor(x: number, y: number);
    constructor(p: PointOptions);
    get type(): string;
    get line(): Line;
    bbox(): import("..").Rectangle;
    closestPoint(p: PointOptions): Point;
    closestPointLength(p: PointOptions): number;
    closestPointNormalizedLength(p: PointOptions): number;
    closestPointTangent(p: PointOptions): Line;
    length(): number;
    divideAt(ratio: number): [Segment, Segment];
    divideAtLength(length: number): [Segment, Segment];
    getSubdivisions(): any[];
    pointAt(ratio: number): Point;
    pointAtLength(length: number): Point;
    tangentAt(ratio: number): Line;
    tangentAtLength(length: number): Line;
    isDifferentiable(): boolean;
    clone(): LineTo;
    scale(sx: number, sy: number, origin?: PointOptions): this;
    rotate(angle: number, origin?: PointOptions): this;
    translate(tx: number, ty: number): this;
    translate(p: PointOptions): this;
    equals(s: Segment): boolean;
    toJSON(): {
        type: string;
        start: {
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
