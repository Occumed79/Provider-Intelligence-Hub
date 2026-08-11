import { createElement as h, Component } from 'preact/compat';
import LogicFlow from '../LogicFlow';
import { IDragParams, StepDrag } from '../util';
import { BaseNodeModel, GraphModel } from '../model';
import NodeData = LogicFlow.NodeData;
import VectorData = LogicFlow.VectorData;
import ResizeNodeData = ResizeControl.ResizeNodeData;
import ResizeInfo = ResizeControl.ResizeInfo;
import ControlItemProps = ResizeControl.ControlItemProps;
export declare enum ResizeControlIndex {
    LEFT_TOP = 0,
    RIGHT_TOP = 1,
    RIGHT_BOTTOM = 2,
    LEFT_BOTTOM = 3
}
export type IResizeControlProps = {
    model: BaseNodeModel;
    graphModel: GraphModel;
} & ControlItemProps;
export type IResizeControlState = {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    dragging: boolean;
};
export declare class ResizeControl extends Component<IResizeControlProps, IResizeControlState> {
    readonly index: ResizeControlIndex;
    readonly nodeModel: BaseNodeModel;
    readonly graphModel: GraphModel;
    readonly dragHandler: StepDrag;
    private isShiftPressed;
    constructor(props: IResizeControlProps);
    bindKeyboardEvents: () => void;
    handleKeyDown: (event: KeyboardEvent) => void;
    handleKeyUp: (event: KeyboardEvent) => void;
    componentWillUnmount(): void;
    updateEdgePointByAnchors: () => void;
    triggerResizeEvent: (preNodeData: ResizeNodeData, curNodeData: ResizeNodeData, deltaX: any, deltaY: any, index: any, nodeModel: BaseNodeModel) => void;
    /**
     * 计算 Control 拖动后，节点的高度信息
     * @param index
     * @param resizeInfo
     * @param pct
     * @param freezeWidth
     * @param freezeHeight
     */
    recalcResizeInfo: (index: ResizeControlIndex, resizeInfo: ResizeInfo, pct?: number, freezeWidth?: boolean, freezeHeight?: boolean) => ResizeInfo;
    resizeNode: ({ deltaX, deltaY }: VectorData) => void;
    onDragStart: () => void;
    onDragging: ({ deltaX, deltaY }: IDragParams) => void;
    onDragEnd: () => void;
    onPointerDown: (e: PointerEvent) => void;
    getViewPosition(direction: any, x: any, y: any): {
        x: any;
        y: any;
    };
    render(): h.JSX.Element;
}
interface IResizeControlGroupProps {
    style: LogicFlow.CommonTheme;
    model: BaseNodeModel;
    graphModel: GraphModel;
}
export declare class ResizeControlGroup extends Component<IResizeControlGroupProps> {
    constructor();
    getResizeControl(): h.JSX.Element[];
    getResizeOutline(): h.JSX.Element;
    render(): h.JSX.Element;
}
export declare namespace ResizeControl {
    type RectShapeResizeProps = {
        width: number;
        height: number;
    };
    type PolygonShapeResizerProps = {
        rx: number;
        ry: number;
    };
    type ResizeProps = RectShapeResizeProps | PolygonShapeResizerProps;
    type ResizeInfo = {
        width: number;
        height: number;
        deltaX: number;
        deltaY: number;
        PCTResizeInfo?: PCTResizeParams;
    };
    type ResizeNodeData = NodeData & Partial<ResizeProps>;
    type Direction = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
    type ControlItemProps = {
        index: ResizeControlIndex;
        direction: Direction;
        x: number;
        y: number;
    };
    type PCTResizeParams = {
        ResizePCT: {
            widthPCT: number;
            heightPCT: number;
        };
        ResizeBasis: {
            basisWidth: number;
            basisHeight: number;
        };
        ScaleLimit: {
            maxScaleLimit: number;
            minScaleLimit: number;
        };
    };
}
export default ResizeControlGroup;
