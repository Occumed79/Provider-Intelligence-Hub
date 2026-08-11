import { Point, type Rectangle } from '../../geometry';
import type { PortLayoutResult } from './index';
export declare function normalizePoint(bbox: Rectangle, args?: {
    x?: string | number;
    y?: string | number;
}): Point;
export declare function toResult<T>(point: Point, angle?: number, rawArgs?: T): PortLayoutResult;
