import { createElement as h, Component } from 'preact/compat';
import LogicFlow from '../../LogicFlow';
import { GraphModel, BaseNodeModel, BaseEdgeModel } from '../../model';
import { IDragParams, StepDrag, NodeContaint } from '../../util';
import Point = LogicFlow.Point;
interface IProps {
    x: number;
    y: number;
    type: AdjustType;
    id?: string;
    getAdjustPointShape: (x: number, y: number, model: BaseEdgeModel) => h.JSX.Element | null;
    graphModel: GraphModel;
    edgeModel: BaseEdgeModel;
}
interface IState {
    dragging: boolean;
    endX: number;
    endY: number;
}
interface OldEdge {
    startPoint: Point;
    endPoint: Point;
    pointsList: Point[];
}
export declare enum AdjustType {
    SOURCE = "SOURCE",
    TARGET = "TARGET"
}
export declare class AdjustPoint extends Component<IProps, IState> {
    stepDragData: any;
    stepDrag: StepDrag;
    oldEdge?: OldEdge;
    preTargetNode: any;
    targetRuleResults: Map<any, any>;
    sourceRuleResults: Map<any, any>;
    constructor(props: IProps);
    handleMouseDown: (ev: PointerEvent) => void;
    onDragStart: () => void;
    onDragging: ({ deltaX, deltaY }: IDragParams) => void;
    onDragEnd: ({ event }: Partial<IDragParams>) => void;
    recoveryEdge: () => void;
    getAdjustPointStyle: () => LogicFlow.CommonTheme;
    isAllowAdjust(info: NodeContaint): {
        pass: boolean;
        msg?: string;
        newTargetNode: BaseNodeModel;
    };
    render(): h.JSX.Element;
}
export default AdjustPoint;
