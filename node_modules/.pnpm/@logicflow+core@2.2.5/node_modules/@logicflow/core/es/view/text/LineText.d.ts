import { createElement as h } from 'preact/compat';
import { BaseText } from '.';
import { BaseEdgeModel, GraphModel } from '../../model';
export type ILineTextProps = {
    model: BaseEdgeModel;
    graphModel: GraphModel;
    draggable: boolean;
    editable: boolean;
    [key: string]: unknown;
};
export type ILineTextState = {
    isHovered: boolean;
};
export declare class LineText extends BaseText<ILineTextProps, ILineTextState> {
    constructor(props: ILineTextProps);
    setHoverOn: () => void;
    setHoverOff: () => void;
    getBackground(): h.JSX.Element | null;
    getShape(): h.JSX.Element | null;
}
export default LineText;
