import { Geometry } from '../geometry';
import { Line } from '../line';
import { Point, PointOptions } from '../point';
import { Rectangle } from '../rectangle';
export interface SegmentOptions {
    precision?: number;
    subdivisions?: Segment[];
}
export declare abstract class Segment extends Geometry {
    isVisible: boolean;
    isSegment: boolean;
    isSubpathStart: boolean;
    nextSegment: Segment | null;
    previousSegment: Segment | null;
    subpathStartSegment: Segment | null;
    protected endPoint: Point;
    get end(): Point;
    get start(): Point;
    abstract get type(): string;
    abstract bbox(): Rectangle | null;
    abstract closestPoint(p: PointOptions): Point;
    abstract closestPointLength(p: PointOptions): number;
    abstract closestPointNormalizedLength(p: PointOptions): number;
    closestPointT(p: PointOptions, options?: SegmentOptions): number;
    abstract closestPointTangent(p: PointOptions): Line | null;
    abstract length(options?: SegmentOptions): number;
    lengthAtT(t: number, options?: SegmentOptions): number;
    abstract divideAt(ratio: number, options?: SegmentOptions): [Segment, Segment];
    abstract divideAtLength(length: number, options?: SegmentOptions): [Segment, Segment];
    divideAtT(t: number): [Segment, Segment];
    abstract getSubdivisions(options?: SegmentOptions): Segment[];
    abstract pointAt(ratio: number): Point;
    abstract pointAtLength(length: number, options?: SegmentOptions): Point;
    pointAtT(t: number): Point;
    abstract tangentAt(ratio: number): Line | null;
    abstract tangentAtLength(length: number, options?: SegmentOptions): Line | null;
    tangentAtT(t: number): Line | null;
    abstract isDifferentiable(): boolean;
    abstract clone(): Segment;
}
