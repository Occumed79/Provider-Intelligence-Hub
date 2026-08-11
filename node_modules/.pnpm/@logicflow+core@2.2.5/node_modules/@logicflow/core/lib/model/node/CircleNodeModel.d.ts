import BaseNodeModel from './BaseNodeModel';
import GraphModel from '../GraphModel';
import LogicFlow from '../../LogicFlow';
import { ModelType } from '../../constant';
import { ResizeControl } from '../../view/Control';
import NodeConfig = LogicFlow.NodeConfig;
import ResizeInfo = ResizeControl.ResizeInfo;
import ResizeNodeData = ResizeControl.ResizeNodeData;
export type ICircleNodeProperties = {
    r?: number;
    style?: LogicFlow.CommonTheme;
    textStyle?: LogicFlow.CommonTheme;
    [key: string]: any;
};
export declare class CircleNodeModel<P extends ICircleNodeProperties = ICircleNodeProperties> extends BaseNodeModel<P> {
    modelType: ModelType;
    r: number;
    get width(): number;
    get height(): number;
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
    getDefaultAnchor(): {
        x: number;
        y: number;
        id: string;
    }[];
    resize(resizeInfo: ResizeInfo): ResizeNodeData;
}
export default CircleNodeModel;
