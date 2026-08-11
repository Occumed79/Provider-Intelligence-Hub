import BaseNodeModel from './BaseNodeModel';
import GraphModel from '../GraphModel';
import LogicFlow from '../../LogicFlow';
import { ModelType } from '../../constant';
import { ResizeControl } from '../../view/Control';
import Point = LogicFlow.Point;
import PointTuple = LogicFlow.PointTuple;
import NodeConfig = LogicFlow.NodeConfig;
import ResizeInfo = ResizeControl.ResizeInfo;
import ResizeNodeData = ResizeControl.ResizeNodeData;
export type IPolygonNodeProperties = {
    points?: PointTuple[];
    width?: number;
    height?: number;
    style?: LogicFlow.CommonTheme;
    textStyle?: LogicFlow.CommonTheme;
    [key: string]: unknown;
};
export declare class PolygonNodeModel<P extends IPolygonNodeProperties = IPolygonNodeProperties> extends BaseNodeModel<P> {
    modelType: ModelType;
    points: PointTuple[];
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
    /**
     * 由于大多数情况下，我们初始化拿到的多边形坐标都是基于原点的（例如绘图工具到处的svg）。
     * 在logicflow中对多边形进行移动，我们不需要去更新points，
     * 而是去更新多边形中心点即可。
     */
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
export default PolygonNodeModel;
