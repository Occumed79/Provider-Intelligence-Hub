import BaseNodeModel from './BaseNodeModel';
import GraphModel from '../GraphModel';
import LogicFlow from '../../LogicFlow';
import { ModelType } from '../../constant';
export type IRectNodeProperties = {
    width?: number;
    height?: number;
    radius?: number;
    style?: LogicFlow.CommonTheme;
    textStyle?: LogicFlow.CommonTheme;
    [key: string]: unknown;
};
export declare class RectNodeModel<P extends IRectNodeProperties = IRectNodeProperties> extends BaseNodeModel<P> {
    modelType: ModelType;
    radius: number;
    constructor(data: LogicFlow.NodeConfig<P>, graphModel: GraphModel);
    setAttributes(): void;
    getDefaultAnchor(): {
        x: number;
        y: number;
        id: string;
    }[];
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
}
export default RectNodeModel;
