import BaseEdgeModel from './BaseEdgeModel';
import { BaseNodeModel } from '../node';
import LogicFlow from '../../LogicFlow';
import GraphModel from '../GraphModel';
import { ModelType } from '../../constant';
import Point = LogicFlow.Point;
import EdgeConfig = LogicFlow.EdgeConfig;
export declare class BezierEdgeModel extends BaseEdgeModel {
    modelType: ModelType;
    offset: number;
    path: string;
    constructor(data: EdgeConfig, graphModel: GraphModel);
    initEdgeData(data: EdgeConfig): void;
    getEdgeStyle(): {
        [x: string]: unknown;
        fill?: string | undefined;
        stroke?: string | undefined;
        strokeWidth?: number | undefined;
        radius?: number | undefined;
        rx?: number | undefined;
        ry?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        path?: string | undefined;
        adjustLine?: LogicFlow.CommonTheme | undefined;
        adjustAnchor?: LogicFlow.CommonTheme | undefined;
    };
    getTextPosition(): Point;
    getData(): {
        pointsList: {
            x: number;
            y: number;
        }[];
        id: string;
        type: string;
        text?: LogicFlow.TextConfig | undefined;
        startPoint: LogicFlow.Point;
        endPoint: LogicFlow.Point;
        sourceNodeId: string;
        sourceAnchorId?: string | undefined;
        targetNodeId: string;
        targetAnchorId?: string | undefined;
        zIndex?: number | undefined;
        properties?: LogicFlow.PropertiesType | undefined;
    };
    private getControls;
    private getPath;
    initPoints(): void;
    updatePoints(): void;
    updatePath(sNext: Point, ePre: Point): void;
    updateStartPoint(anchor: Point): void;
    updateEndPoint(anchor: Point): void;
    moveStartPoint(deltaX: number, deltaY: number): void;
    moveEndPoint(deltaX: number, deltaY: number): void;
    updateAdjustAnchor(anchor: Point, type: string): void;
    getAdjustStart(): LogicFlow.Point;
    getAdjustEnd(): LogicFlow.Point;
    updateAfterAdjustStartAndEnd({ startPoint, endPoint, sourceNode, targetNode, }: {
        startPoint: Point;
        endPoint: Point;
        sourceNode: BaseNodeModel;
        targetNode: BaseNodeModel;
    }): void;
}
export default BezierEdgeModel;
