import { Component } from 'preact/compat';
import { BaseNode } from './node';
import LogicFlow from '../LogicFlow';
import { GraphModel, BaseNodeModel, Model } from '../model';
import { StepDrag, IDragParams } from '../util';
import AnchorConfig = Model.AnchorConfig;
interface IProps {
    anchorData: AnchorConfig;
    node: BaseNode<any>;
    style?: Record<string, any>;
    hoverStyle?: Record<string, any>;
    edgeStyle?: Record<string, any>;
    anchorIndex: number;
    graphModel: GraphModel;
    nodeModel: BaseNodeModel;
    setHoverOff: (e: PointerEvent) => void;
}
interface IState {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    dragging: boolean;
}
declare class Anchor extends Component<IProps, IState> {
    preTargetNode?: BaseNodeModel;
    sourceRuleResults: Map<string, Model.ConnectRuleResult>;
    targetRuleResults: Map<string, Model.ConnectRuleResult>;
    dragHandler: StepDrag;
    t: any;
    constructor();
    getAnchorShape(): import("preact/compat").JSX.Element;
    onDragStart: ({ event }: Partial<IDragParams>) => void;
    onDragging: ({ event }: IDragParams) => void;
    onDragEnd: ({ event }: Partial<IDragParams>) => void;
    get customTrajectory(): ((props: import("..").Options.CustomAnchorLineProps) => import("preact/compat").JSX.Element) | undefined;
    get relateEdges(): {
        incomingEdgeList: import("../model").BaseEdgeModel<LogicFlow.PropertiesType>[];
        outgoingEdgeList: import("../model").BaseEdgeModel<LogicFlow.PropertiesType>[];
    };
    checkEnd: (event: PointerEvent | null | undefined) => import("../model").BaseEdgeModel<LogicFlow.PropertiesType> | null | undefined;
    moveAnchorEnd(endX: number, endY: number, event?: PointerEvent): void;
    validateAndSetState(targetNode: BaseNodeModel, anchorId: string | undefined, targetAnchor: AnchorConfig, nodeModel: BaseNodeModel, anchorData: AnchorConfig): void;
    isShowLine(): boolean;
    render(): import("preact/compat").JSX.Element;
}
export default Anchor;
