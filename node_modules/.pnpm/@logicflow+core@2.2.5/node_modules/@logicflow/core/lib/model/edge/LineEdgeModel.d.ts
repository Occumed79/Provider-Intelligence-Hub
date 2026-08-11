import LogicFlow from '../../LogicFlow';
import BaseEdgeModel from './BaseEdgeModel';
import { ModelType } from '../../constant';
import Point = LogicFlow.Point;
export declare class LineEdgeModel extends BaseEdgeModel {
    modelType: ModelType;
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
    initEdgeData(data: LogicFlow.EdgeConfig): void;
    getPath(points: Point[]): string;
    getTextPosition(): Point;
}
export default LineEdgeModel;
