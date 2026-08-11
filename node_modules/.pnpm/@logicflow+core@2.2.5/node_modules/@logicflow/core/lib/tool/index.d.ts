import { Component, ReactElement } from 'preact/compat';
import LogicFlow from '../LogicFlow';
import { GraphModel, BaseEdgeModel, BaseNodeModel } from '../model';
export type IToolProps = {
    lf: LogicFlow;
    graphModel: GraphModel;
    textEditElement?: BaseNodeModel | BaseEdgeModel;
};
type ToolConstructor = new (props: IToolProps) => Component<IToolProps>;
export declare class Tool {
    tools?: Component[];
    components?: ReactElement<IToolProps>[];
    toolMap: Map<string, ToolConstructor>;
    disabledToolMap: Map<string, ToolConstructor>;
    instance: LogicFlow;
    constructor(instance: LogicFlow);
    private isDisabled;
    registerTool(name: string, component: ToolConstructor): void;
    disableTool(name: string): boolean | Error;
    enableTool(name: string): boolean | Error;
    getTools(): ToolConstructor[];
    getInstance(): LogicFlow;
    destroy(): void;
}
export default Tool;
