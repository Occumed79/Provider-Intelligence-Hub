import { Line } from '../line';
import { Segment } from './segment';
import type { PointOptions } from '../point';
export declare class Close extends Segment {
    static create(): Close;
    get end(): import("../point").Point;
    get type(): string;
    get line(): Line;
    bbox(): import("..").Rectangle;
    closestPoint(p: PointOptions): import("../point").Point;
    closestPointLength(p: PointOptions): number;
    closestPointNormalizedLength(p: PointOptions): number;
    closestPointTangent(p: PointOptions): Line;
    length(): number;
    divideAt(ratio: number): [Segment, Segment];
    divideAtLength(length: number): [Segment, Segment];
    getSubdivisions(): any[];
    pointAt(ratio: number): import("../point").Point;
    pointAtLength(length: number): import("../point").Point;
    tangentAt(ratio: number): Line;
    tangentAtLength(length: number): Line;
    isDifferentiable(): boolean;
    scale(): this;
    rotate(): this;
    translate(): this;
    equals(s: Segment): boolean;
    clone(): Close;
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
