import { Component } from 'preact/compat';
import Dnd from '../behavior/dnd';
import GraphModel from '../../model/GraphModel';
import { StepDrag, IDragParams } from '../../util';
type IProps = {
    graphModel: GraphModel;
    dnd: Dnd;
};
type IState = {
    isDragging: boolean;
};
export declare class CanvasOverlay extends Component<IProps, IState> {
    stepDrag: StepDrag;
    stepScrollX: number;
    stepScrollY: number;
    pointers: Map<number, {
        x: number;
        y: number;
    }>;
    pinchStartDistance?: number;
    pinchStartScale?: number;
    pinchLastCenterX?: number;
    pinchLastCenterY?: number;
    longPressTimer?: number;
    constructor(props: IProps);
    onDragging: ({ deltaX, deltaY }: IDragParams) => void;
    onDragEnd: () => void;
    zoomHandler: (ev: WheelEvent) => void;
    clickHandler: (ev: MouseEvent) => void;
    handleContextMenu: (ev: MouseEvent) => void;
    pointerDownHandler: (ev: PointerEvent) => void;
    pointerMoveHandler: (ev: PointerEvent) => void;
    pointerUpHandler: (ev: PointerEvent) => void;
    render(): import("preact/compat").JSX.Element;
}
export default CanvasOverlay;
