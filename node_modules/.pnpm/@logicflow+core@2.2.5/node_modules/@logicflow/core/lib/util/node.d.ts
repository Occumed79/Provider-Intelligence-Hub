import { createElement as h } from 'preact/compat';
import LogicFlow from '../LogicFlow';
import { GraphModel, Model, BaseNodeModel } from '../model';
import Point = LogicFlow.Point;
import Direction = LogicFlow.Direction;
import NodeConfig = LogicFlow.NodeConfig;
import AnchorInfo = Model.AnchorInfo;
import BoxBoundsPoint = Model.BoxBoundsPoint;
export declare const getAnchors: (data: BaseNodeModel) => Model.AnchorConfig[];
export type NodeContaint = {
    node: BaseNodeModel;
    anchorIndex: number;
    anchor: Model.AnchorConfig;
};
export declare const targetNodeInfo: (position: Point, graphModel: GraphModel) => NodeContaint;
export declare const getClosestAnchor: (position: Point, node: BaseNodeModel) => AnchorInfo;
export declare const distance: (x1: number, y1: number, x2: number, y2: number) => number;
export declare const isInNode: (position: Point, node: BaseNodeModel, offset?: number) => boolean;
export declare const isInNodeBbox: (position: Point, node: BaseNodeModel) => boolean;
export type NodeBBox = {
    x: number;
    y: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
} & BoxBoundsPoint;
export declare const getNodeBBox: (node: BaseNodeModel) => NodeBBox;
type RadiusCircle = {
    x: number;
    y: number;
    r: number;
};
export declare const getRectRadiusCircle: (node: BaseNodeModel) => [RadiusCircle, RadiusCircle, RadiusCircle, RadiusCircle];
export declare const getClosestRadiusCenter: (point: Point, direction: Direction, node: BaseNodeModel) => Point;
export declare const getCrossPointWithCircle: (point: Point, direction: Direction, node: RadiusCircle) => Point;
export declare const pointEdgeDirection: (point: Point, node: BaseNodeModel) => Direction;
export declare const inStraightLineOfRect: (point: Point, node: BaseNodeModel) => boolean;
export declare const getCrossPointWithEllipse: (point: Point, direction: Direction, node: BaseNodeModel) => Point;
export declare const getCrossPointWithPolygon: (point: Point, direction: Direction, node: BaseNodeModel) => Point;
export declare const pickNodeConfig: (data: NodeConfig) => NodeConfig;
/**
 * 基于节点的边，重新获取新的节点
 */
export declare const getNodeAnchorPosition: (center: BaseNodeModel, point: Point, width: number, height: number) => {
    x: number;
    y: number;
};
/*********************************************************
 * Text 节点文本相关工具函数
 ********************************************************/
export declare const getHtmlTextHeight: ({ rows, style, rowsLength, className, }: {
    rows: string[];
    style: h.JSX.CSSProperties;
    rowsLength: number;
    className: string;
}) => number;
export declare const getSvgTextWidthHeight: ({ rows, rowsLength, fontSize, }: {
    rows: string[];
    rowsLength: number;
    fontSize: number;
}) => {
    width: number;
    height: number;
};
/**
 * @description 格式化边校验信息
 */
export declare const formatAnchorConnectValidateData: (data: Model.ConnectRuleResult) => Model.ConnectRuleResult;
export {};
