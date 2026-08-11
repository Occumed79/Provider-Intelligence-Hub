import { BaseEdgeModel } from '.';
import { BaseNodeModel, Model } from '..';
import LogicFlow from '../../LogicFlow';
import { ModelType, SegmentDirection } from '../../constant';
import Point = LogicFlow.Point;
import Position = LogicFlow.Position;
import AppendConfig = LogicFlow.AppendConfig;
import AnchorConfig = Model.AnchorConfig;
export declare class PolylineEdgeModel extends BaseEdgeModel {
    modelType: ModelType;
    draggingPointList: Point[];
    offset?: number;
    dbClickPosition?: Point;
    initEdgeData(data: LogicFlow.EdgeConfig): void;
    setAttributes(): void;
    orthogonalizePath(points: Point[]): Point[];
    /**
     * 计算默认 offset：箭头与折线重叠长度 + 5
     * 重叠长度采用箭头样式中的 offset（沿边方向的长度）
     */
    private getDefaultOffset;
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
    };
    getTextPosition(): {
        x: number;
        y: number;
    };
    getAfterAnchor(direction: SegmentDirection, position: Position, anchorList: AnchorConfig[]): Model.AnchorConfig;
    getCrossPoint(direction: SegmentDirection, start: Position, end: Position): LogicFlow.Point;
    removeCrossPoints(startIndex: number, endIndex: number, pointList: Point[]): LogicFlow.Point[];
    getDraggingPoints(direction: SegmentDirection, positionType: string, position: Position, anchorList: AnchorConfig[], draggingPointList: Point[]): LogicFlow.Point[];
    updateCrossPoints(pointList: Point[]): LogicFlow.Point[];
    updatePath(pointList: Point[]): void;
    getData(): LogicFlow.EdgeData & {
        pointsList: {
            x: number;
            y: number;
        }[];
    };
    getPath(points: Point[]): string;
    initPoints(): void;
    updatePoints(): void;
    updateStartPoint(anchor: Point): void;
    moveStartPoint(deltaX: number, deltaY: number): void;
    updateEndPoint(anchor: Point): void;
    moveEndPoint(deltaX: number, deltaY: number): void;
    updatePointsList(deltaX: number, deltaY: number): void;
    dragAppendStart(): void;
    dragAppendSimple(appendInfo: AppendConfig, dragInfo: Record<'x' | 'y', number>): {
        start: {
            [key: string]: any;
            id?: string | undefined;
        } & LogicFlow.Position;
        end: {
            [key: string]: any;
            id?: string | undefined;
        } & LogicFlow.Position;
        startIndex: number;
        endIndex: number;
        direction: SegmentDirection;
    };
    dragAppend(appendInfo: AppendConfig, dragInfo: Record<'x' | 'y', number>): {
        start: {
            [key: string]: any;
            id?: string | undefined;
        } & LogicFlow.Position;
        end: {
            [key: string]: any;
            id?: string | undefined;
        } & LogicFlow.Position;
        startIndex: number;
        endIndex: number;
        direction: SegmentDirection;
    };
    dragAppendEnd(): void;
    updatePointsAfterDrag(pointsList: Point[]): void;
    getAdjustStart(): LogicFlow.Point;
    getAdjustEnd(): LogicFlow.Point;
    updateAfterAdjustStartAndEnd({ startPoint, endPoint, sourceNode, targetNode, }: {
        startPoint: Point;
        endPoint: Point;
        sourceNode: BaseNodeModel;
        targetNode: BaseNodeModel;
    }): void;
}
export default PolylineEdgeModel;
