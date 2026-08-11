import { Component } from 'preact/compat';
import LogicFlow from '../LogicFlow';
import EventEmitter from '../event/eventEmitter';
import { GraphModel, BaseNodeModel } from '../model';
import { Vector } from '../util';
interface IRotateControlProps {
    graphModel: GraphModel;
    nodeModel: BaseNodeModel;
    eventCenter: EventEmitter;
    style: LogicFlow.CommonTheme;
}
declare class RotateControlPoint extends Component<IRotateControlProps> {
    readonly style: {};
    private defaultAngle;
    normal: Vector;
    stepperDrag: any;
    constructor(props: IRotateControlProps);
    onDragging: ({ event }: any) => void;
    render(): import("preact/compat").JSX.Element;
}
export default RotateControlPoint;
