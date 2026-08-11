import { createElement as h, Component } from 'preact/compat';
import { IReactionDisposer } from 'mobx';
import LogicFlow from '../../LogicFlow';
import { GraphModel, BaseNodeModel, Model } from '../../model';
import { StepDrag, IDragParams } from '../../util';
type IProps = {
    model: BaseNodeModel;
    graphModel: GraphModel;
};
type IState = {
    isDragging?: boolean;
};
export declare abstract class BaseNode<P extends IProps = IProps> extends Component<P, IState> {
    static isObserved: boolean;
    static extendsKey?: string;
    t: any;
    moveOffset?: LogicFlow.OffsetData;
    stepDrag: StepDrag;
    mouseUpDrag?: boolean;
    startTime?: number;
    modelDisposer: IReactionDisposer;
    longPressTimer?: number;
    mouseDownPosition?: LogicFlow.Position;
    constructor(props: IProps);
    componentWillUnmount(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    abstract getShape(): h.JSX.Element | null;
    getAnchorShape(_anchorData?: Model.AnchorConfig): h.JSX.Element | null;
    getAnchors(): h.JSX.Element[];
    getRotateControl(): h.JSX.Element | undefined;
    getResizeControl(): h.JSX.Element | null;
    getText(): h.JSX.Element | null;
    getStateClassName(): string;
    onDragStart: ({ event }: Partial<IDragParams>) => void;
    onDragging: ({ event }: IDragParams) => void;
    onDragEnd: () => void;
    onMouseOut: (ev: MouseEvent) => void;
    handleMouseUp: () => void;
    handleClick: (e: MouseEvent) => void;
    handleContextMenu: (ev: MouseEvent) => void;
    handleMouseDown: (ev: PointerEvent) => void;
    handleFocus: () => void;
    handleBlur: () => void;
    setHoverOn: (ev: MouseEvent) => void;
    setHoverOff: (ev: MouseEvent) => void;
    /**
     *  @overridable 支持重写, 节点置顶，可以被某些不需要置顶的节点重写，如group节点。
     */
    toFront(): void;
    render(): h.JSX.Element;
}
export default BaseNode;
