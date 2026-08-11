import LogicFlow from '../LogicFlow';
import { Options } from '../options';
import { Model, BaseNodeModel, BaseEdgeModel, GraphModel } from '../model';
import Point = LogicFlow.Point;
import Direction = LogicFlow.Direction;
import EdgeConfig = LogicFlow.EdgeConfig;
import Position = LogicFlow.Position;
import BoxBounds = Model.BoxBounds;
type PolyPointMap = Record<string, Point>;
type PolyPointLink = Record<string, string>;
export declare const setupEdgeModel: (edge: EdgeConfig, graphModel: GraphModel) => BaseEdgeModel<LogicFlow.PropertiesType>;
export declare const isBboxOverLapping: (b1: BoxBounds, b2: BoxBounds) => boolean;
export declare const filterRepeatPoints: (points: Point[]) => Point[];
export declare const getSimplePolyline: (sPoint: Point, tPoint: Point) => Point[];
export declare const getExpandedBBox: (bbox: BoxBounds, offset: number) => BoxBounds;
export declare const pointDirection: (point: Point, bbox: BoxBounds) => Direction;
/**
 * 计算扩展包围盒上的相邻点（起点或终点的下一个/上一个拐点）
 * - 使用原始节点 bbox 来判定点相对中心的方向，避免 offset 扩展后宽高改变导致方向误判
 * - 若 start 相对中心为水平方向，则返回扩展盒在 x 上的边界，y 保持不变
 * - 若为垂直方向，则返回扩展盒在 y 上的边界，x 保持不变
 * @param expendBBox 扩展后的包围盒（包含 offset）
 * @param bbox 原始节点包围盒（用于正确的方向判定）
 * @param point 起点或终点坐标
 */
export declare const getExpandedBBoxPoint: (expendBBox: BoxBounds, bbox: BoxBounds, point: Point) => Point;
export declare const mergeBBox: (b1: BoxBounds, b2: BoxBounds) => BoxBounds;
export declare const getBBoxOfPoints: (points?: Point[], offset?: number, heightOffset?: number) => BoxBounds;
export declare const getPointsFromBBox: (bbox: BoxBounds) => [Point, Point, Point, Point];
export declare const isPointOutsideBBox: (point: Point, bbox: BoxBounds) => boolean;
export declare const getBBoxXCrossPoints: (bbox: BoxBounds, x: number) => [Point, Point] | [
];
export declare const getBBoxYCrossPoints: (bbox: BoxBounds, y: number) => [Point, Point] | [
];
export declare const getBBoxCrossPointsByPoint: (bbox: BoxBounds, point: Point) => [Point, Point, Point, Point] | [Point, Point] | [
];
export declare const estimateDistance: (p1: Point, p2: Point) => number;
export declare const costByPoints: (p: Point, points: Point[]) => number;
export declare const heuristicCostEstimate: (p: Point, ps: Point, pt: Point, source?: Point, target?: Point) => number;
export declare const rebuildPath: (pathPoints: Point[], pointById: PolyPointMap, cameFrom: PolyPointLink, currentId: string, iterator?: number) => void;
export declare const removeClosePointFromOpenList: (arr: Point[], item: Point) => void;
export declare const isSegmentsIntersected: (p0: Point, p1: Point, p2: Point, p3: Point) => boolean;
export declare const isSegmentCrossingBBox: (p1: Point, p2: Point, bbox: BoxBounds) => boolean;
/**
 * 基于轴对齐规则获取某点的相邻可连通点（不穿越节点）
 * - 仅考虑 x 或 y 相同的候选点，保证严格水平/垂直
 * - 使用 isSegmentCrossingBBox 校验线段不穿越源/目标节点
 */
export declare const getNextNeighborPoints: (points: Point[], point: Point, bbox1: BoxBounds, bbox2: BoxBounds) => Point[];
/**
 * 使用 A* + 曼哈顿启发式在候选点图上查找正交路径
 * - 开放集/关闭集管理遍历
 * - gScore 为累计实际代价，fScore = gScore + 启发式
 * - 邻居仅为与当前点 x 或 y 相同且不穿越节点的点
 * 参考：https://zh.wikipedia.org/wiki/A*%E6%90%9C%E5%B0%8B%E6%BC%94%E7%AE%97%E6%B3%95
 */
export declare const pathFinder: (points: Point[], start: Point, goal: Point, sBBox: BoxBounds, tBBox: BoxBounds, os: Point, ot: Point) => Point[];
export declare const getBoxByOriginNode: (node: BaseNodeModel) => BoxBounds;
/**
 * 去除共线冗余中间点，保持每条直线段仅保留两端点
 * - 若三点在同一水平线或同一垂直线，移除中间点
 */
export declare const pointFilter: (points: Point[]) => Point[];
/**
 * 计算折线点（正交候选点 + A* 路径）
 * 步骤：
 * 1) 取源/目标节点的扩展包围盒与相邻点 sPoint/tPoint
 * 2) 若两个扩展盒重合，使用简单路径 getSimplePoints
 * 3) 构造 lineBBox/sMixBBox/tMixBBox，并收集其角点与中心交点
 * 4) 过滤掉落在两个扩展盒内部的点，形成 connectPoints
 * 5) 以 sPoint/tPoint 为起止，用 A* 查找路径
 * 6) 拼入原始 start/end，并用 pointFilter 去除冗余共线点
 */
export declare const getPolylinePoints: (start: Point, end: Point, sNode: BaseNodeModel, tNode: BaseNodeModel, offset: number) => Point[];
/**
 * 获取折线中最长的一个线
 * @param pointsList 多个点组成的数组
 */
export declare const getLongestEdge: (pointsList: Point[]) => [Point, Point];
export declare const isSegmentsInNode: (start: Point, end: Point, node: BaseNodeModel) => boolean;
export declare const isSegmentsCrossNode: (start: Point, end: Point, node: BaseNodeModel) => boolean;
export declare const getCrossPointInRect: (start: Point, end: Point, node: BaseNodeModel) => Point | false | undefined;
export declare const segmentDirection: (start: Point, end: Point) => Direction | undefined;
export declare const points2PointsList: (points: string) => Point[];
/**
 * 当扩展 bbox 重合时的简化拐点计算
 * - 根据起止段的方向（水平/垂直）插入 1~2 个中间点，避免折线重合与穿越
 */
export declare const getSimplePoints: (start: Point, end: Point, sPoint: Point, tPoint: Point) => Point[];
export declare const getBytesLength: (word: string) => number;
export declare const getTextWidth: (text: string, font: string) => number;
type AppendAttributesType = {
    d: string;
    fill: string;
    stroke: string;
    strokeWidth: number;
    strokeDasharray: string;
};
export declare const getAppendAttributes: (appendInfo: Record<'start' | 'end', Point>) => AppendAttributesType;
export type IBezierControls = {
    sNext: Point;
    ePre: Point;
};
export declare const getBezierControlPoints: ({ start, end, sourceNode, targetNode, offset, }: {
    start: Point;
    end: Point;
    sourceNode: BaseNodeModel;
    targetNode: BaseNodeModel;
    offset: number;
}) => IBezierControls;
export type IBezierPoints = {
    start: Point;
    sNext: Point;
    ePre: Point;
    end: Point;
};
export declare const getBezierPoints: (path: string) => [Point, Point, Point, Point];
export declare const getEndTangent: (pointsList: Point[], offset: number) => [Point, Point];
/**
 * 获取移动边后，文本位置距离边上的最近的一点
 * @param point 边上文本的位置
 * @param points 边的各个拐点
 * TODO: Label实验没问题后统一改成新的计算方式，把这个方法废弃
 */
export declare const getClosestPointOfPolyline: (point: Point, points: string) => Point;
export declare const pickEdgeConfig: (data: EdgeConfig) => EdgeConfig;
export declare const twoPointDistance: (source: Position, target: Position) => number;
/**
 * 包装边生成函数
 * @param graphModel graph model
 * @param generator 用户自定义的边生成函数
 */
export declare function createEdgeGenerator(graphModel: GraphModel, generator?: Options.EdgeGeneratorType | unknown): any;
export type IGetSvgTextSizeParams = {
    rows: string[];
    rowsLength: number;
    fontSize: number;
};
export declare const getSvgTextSize: ({ rows, rowsLength, fontSize, }: IGetSvgTextSizeParams) => LogicFlow.RectSize;
export {};
