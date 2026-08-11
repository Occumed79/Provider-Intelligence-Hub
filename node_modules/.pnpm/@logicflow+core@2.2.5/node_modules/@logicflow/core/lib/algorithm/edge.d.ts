import LogicFlow from '../LogicFlow';
import Point = LogicFlow.Point;
/**
 * 求两个线段交点入参：线段1端点: ab, 线段2端点： cd,
 * @param a
 * @param b
 * @param c
 * @param d
 * @return：有交点返回交点 Point，无交点返回false
 */
export declare const getCrossPointOfLine: (a: Point, b: Point, c: Point, d: Point) => false | {
    x: number;
    y: number;
};
export declare const isInSegment: (point: Point, start: Point, end: Point) => boolean;
