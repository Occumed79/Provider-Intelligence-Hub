import { Component } from 'preact/compat';
import { IToolProps } from '.';
import { StepDrag, IDragParams } from '../util';
export default class MultipleSelect extends Component<IToolProps> {
    static toolName: string;
    stepDrag: StepDrag;
    constructor(props: IToolProps);
    handleMouseDown: (ev: PointerEvent) => void;
    handleWheelEvent: (ev: WheelEvent) => void;
    onDragging: ({ deltaX, deltaY }: IDragParams) => void;
    handleContextMenu: (ev: MouseEvent) => void;
    render(): import("preact/compat").JSX.Element | undefined;
}
