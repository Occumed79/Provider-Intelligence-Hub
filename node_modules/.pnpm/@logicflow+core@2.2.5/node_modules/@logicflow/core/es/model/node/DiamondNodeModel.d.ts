import GraphModel from '../GraphModel';
import BaseNodeModel from './BaseNodeModel';
import LogicFlow from '../../LogicFlow';
import { ModelType } from '../../constant';
import { ResizeControl } from '../../view/Control';
import Point = LogicFlow.Point;
import PointTuple = LogicFlow.PointTuple;
import NodeConfig = LogicFlow.NodeConfig;
import ResizeInfo = ResizeControl.ResizeInfo;
import ResizeNodeData = ResizeControl.ResizeNodeData;
export type IDiamondNodeProperties = {
    rx?: number;
    ry?: number;
    style?: LogicFlow.CommonTheme;
    textStyle?: LogicFlow.CommonTheme;
    [key: string]: unknown;
};
export declare class DiamondNodeModel<P extends IDiamondNodeProperties = IDiamondNodeProperties> extends BaseNodeModel<P> {
    modelType: ModelType;
    rx: number;
    ry: number;
    constructor(data: NodeConfig<P>, graphModel: GraphModel);
    setAttributes(): void;
    getNodeStyle(): {
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
    get points(): PointTuple[];
    get pointsPosition(): Point[];
    get width(): number;
    get height(): number;
    getDefaultAnchor(): {
        x: number;
        y: number;
        id: string;
    }[];
    resize(resizeInfo: ResizeInfo): ResizeNodeData;
}
export default DiamondNodeModel;
