import LogicFlow from '../LogicFlow';
import PointTuple = LogicFlow.PointTuple;
import Point = LogicFlow.Point;
export declare function snapToGrid(point: number, gridSize: number, snapGrid: boolean): number;
export declare function getGridOffset(distance: number, gridSize: number): number;
/**
 * 多边形设置 points 后，坐标平移至原点 并 根据 width、height 缩放
 * @param points
 * @param width
 * @param height
 */
export declare function normalizePolygon(points?: PointTuple[], width?: number, height?: number): PointTuple[];
/**
 * 通用圆角生成：为菱形、多边形、折线在转折处生成与矩形视觉一致的圆角
 * - 圆角基于角平分线，切点距顶点的距离 t = r * tan(theta/2)
 * - 半径会根据相邻边长度进行钳制，避免超过边长造成断裂
 * - 多边形/菱形保持闭合；折线保持开口
 */
export declare const generateRoundedCorners: (points: Point[], radius: number, isClosedShape: boolean) => Point[];
