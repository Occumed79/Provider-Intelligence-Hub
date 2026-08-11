type Point = {
    x: number;
    y: number;
};
type BezierControlPoint = {
    left?: Point;
    pt: Point;
    right?: Point;
};
type DrawingCommand = {
    type: 'M';
    x: number;
    y: number;
} | {
    type: 'L';
    x: number;
    y: number;
} | {
    type: 'H';
    x: number;
} | {
    type: 'V';
    y: number;
} | {
    type: 'C';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x: number;
    y: number;
} | {
    type: 'Q';
    x1: number;
    y1: number;
    x: number;
    y: number;
} | {
    type: 'Z';
};

declare class BezierSegment {
    A: Point;
    B: Point;
    C: Point;
    D: Point;
    constructor(A: Point, B: Point, C: Point, D: Point);
    static sampleSpacing(): number;
    tangentAtParameter(parameter: number): {
        x: number;
        y: number;
    };
    isLinear(): boolean;
    pointAtParameter(parameter: number): {
        x: number;
        y: number;
    };
    private _totalLength;
    getTotalLength(): number;
}

declare class BezierPath {
    segments: BezierSegment[];
    private _totalLength;
    samples: {
        dist: number;
        pt: Point;
        tan: Point;
        segIdx: number;
        t: number;
    }[];
    constructor(segments: BezierSegment[]);
    segmentStartEnds: {
        start: number;
        end: number;
    }[];
    private _jumps;
    jumps(): number[];
    getTotalLength(): number;
    private findClosestSampleIdx;
    getPointAtLength(length: number, approximate?: boolean): Point;
    getAngleAtLength(length: number, approximate?: boolean): number;
    getTangentAtLength(length: number, approximate?: boolean): Point;
}

declare const createFromPath: (el: SVGPathElement) => BezierPath;
declare const createFromLine: (el: SVGLineElement) => BezierPath;
declare const createFromCircle: (el: SVGCircleElement) => BezierPath;
declare const createFromElement: (el: SVGElement) => BezierPath;
declare const create: (points: BezierControlPoint[]) => BezierPath;
declare const createFromCommands: (rawCommands: DrawingCommand[]) => BezierPath;

export { BezierPath, BezierSegment, create, createFromCircle, createFromCommands, createFromElement, createFromLine, createFromPath };
export type { BezierControlPoint, DrawingCommand, Point };
