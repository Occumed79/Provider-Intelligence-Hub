import BaseNodeModel from './BaseNodeModel';
import { Model } from '../BaseModel';
import { ModelType } from '../../constant';
import AnchorConfig = Model.AnchorConfig;
import LogicFlow from '../../LogicFlow';
import GraphModel from '../GraphModel';
export interface IHtmlNodeProperties {
    width?: number;
    height?: number;
    style?: LogicFlow.CommonTheme;
    textStyle?: LogicFlow.CommonTheme;
    [key: string]: unknown;
}
export declare class HtmlNodeModel<P extends IHtmlNodeProperties = IHtmlNodeProperties> extends BaseNodeModel<P> {
    modelType: ModelType;
    constructor(data: LogicFlow.NodeConfig<P>, graphModel: GraphModel);
    setAttributes(): void;
    getDefaultAnchor(): AnchorConfig[];
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
export default HtmlNodeModel;
