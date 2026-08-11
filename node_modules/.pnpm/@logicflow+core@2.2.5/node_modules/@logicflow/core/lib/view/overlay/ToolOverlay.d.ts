import { createElement as h, Component } from 'preact/compat';
import { OutlineOverlay } from '.';
import { GraphModel } from '../../model';
import { Tool } from '../../tool';
type IProps = {
    graphModel: GraphModel;
    tool: Tool;
};
export declare class ToolOverlay extends Component<IProps> {
    componentDidMount(): void;
    componentDidUpdate(): void;
    /**
     * 外部传入的一般是HTMLElement
     */
    getTools(): import("preact").VNode<import("../..").IToolProps>[];
    triggerToolRender(): void;
    render(): h.JSX.Element;
}
export default OutlineOverlay;
