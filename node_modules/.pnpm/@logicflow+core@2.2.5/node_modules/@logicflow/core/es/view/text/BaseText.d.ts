import { createElement as h, Component } from 'preact/compat';
import { GraphModel, BaseNodeModel, BaseEdgeModel } from '../../model';
import { IDragParams, StepDrag } from '../../util';
export type IBaseTextProps = {
    model: BaseNodeModel | BaseEdgeModel;
    graphModel: GraphModel;
    draggable: boolean;
    editable: boolean;
};
export type IBaseTextState = {
    isHovered: boolean;
};
export declare class BaseText<P extends IBaseTextProps, S extends IBaseTextState> extends Component<P, S> {
    stepperDrag: StepDrag;
    constructor(props: P);
    getShape(): h.JSX.Element | null;
    mouseDownHandler: (e: PointerEvent) => void;
    onDragging: ({ deltaX, deltaY }: IDragParams) => void;
    dbClickHandler: () => void;
    render(): h.JSX.Element | undefined;
}
export default BaseText;
