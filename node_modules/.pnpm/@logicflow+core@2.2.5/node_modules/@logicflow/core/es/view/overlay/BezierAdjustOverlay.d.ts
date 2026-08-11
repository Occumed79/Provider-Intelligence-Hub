import { Component } from 'preact/compat';
import LogicFlow from '../../LogicFlow';
import { StepDrag, IDragParams } from '../../util';
import { GraphModel, BezierEdgeModel } from '../../model';
import Point = LogicFlow.Point;
type IProps = {
    graphModel: GraphModel;
};
type IAnchorProps = {
    position: Point;
    bezierModel: BezierEdgeModel;
    graphModel: GraphModel;
    type: string;
};
type IState = {
    endX: number;
    endY: number;
};
export declare class BezierAdjustAnchor extends Component<IAnchorProps, IState> {
    dragHandler: StepDrag;
    constructor();
    onDragging: ({ event }: IDragParams) => void;
    onDragEnd: () => void;
    render(): import("preact/compat").JSX.Element;
}
export declare class BezierAdjustOverlay extends Component<IProps> {
    getBezierAdjust(bezier: BezierEdgeModel, graphModel: GraphModel): any;
    selectedBezierEdge(): any;
    render(): import("preact/compat").JSX.Element;
}
export default BezierAdjustOverlay;
