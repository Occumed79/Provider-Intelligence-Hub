import { GraphModel, BaseNodeModel } from '.';
import LogicFlow from '../LogicFlow';
import Position = LogicFlow.Position;
import NodeData = LogicFlow.NodeData;
export type ISnaplineInfo = {
    isShowHorizontal: boolean;
    isShowVertical: boolean;
    position: Position;
};
export declare class SnaplineModel {
    graphModel: GraphModel;
    isShowHorizontal: boolean;
    isShowVertical: boolean;
    position: Position;
    epsilon: number;
    constructor(graphModel: GraphModel, epsilon?: number);
    getStyle(): {
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
    private getCenterSnapLine;
    private getHorizontalSnapline;
    private getVerticalSnapline;
    getSnapLinePosition(draggingNode: NodeData, nodes: BaseNodeModel[]): ISnaplineInfo;
    private setSnaplineInfo;
    clearSnapline(): void;
    setNodeSnapLine(nodeData: NodeData): void;
}
export default SnaplineModel;
