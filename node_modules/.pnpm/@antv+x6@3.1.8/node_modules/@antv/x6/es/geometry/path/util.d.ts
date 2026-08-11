import { PointLike } from '../point';
export declare function isValid(data: any): boolean;
export interface DrawPointsOptions {
    round?: number;
    initialMove?: boolean;
    close?: boolean;
    exclude?: number[];
}
export declare function drawPoints(points: PointLike[], options?: DrawPointsOptions): string;
/**
 * Converts the given arc to a series of curves.
 */
export declare function arcToCurves(x0: number, y0: number, r1: number, r2: number, angle: number, largeArcFlag: number, sweepFlag: number, x: number, y: number): number[];
export declare function drawArc(startX: number, startY: number, rx: number, ry: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, stopX: number, stopY: number): string;
