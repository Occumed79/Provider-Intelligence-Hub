import { Component, ComponentType } from 'preact/compat';
import DnD from './behavior/dnd';
import Tool from '../tool';
import { Options as LFOptions } from '../options';
import { GraphModel, BaseEdgeModel, BaseNodeModel, SnaplineModel } from '../model';
type IGraphProps = {
    getView: (type: string) => ComponentType<any> | undefined;
    tool: Tool;
    options: LFOptions.Definition;
    dnd: DnD;
    snaplineModel?: SnaplineModel;
    graphModel: GraphModel;
};
declare class Graph extends Component<IGraphProps> {
    private handleResize;
    private throttleResize;
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    getComponent(model: BaseEdgeModel | BaseNodeModel, graphModel: GraphModel, overlay?: string): import("preact/compat").JSX.Element | null;
    render(): import("preact/compat").JSX.Element;
}
export default Graph;
