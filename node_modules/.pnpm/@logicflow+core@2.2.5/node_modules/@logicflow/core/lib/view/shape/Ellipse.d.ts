import { createElement as h } from 'preact/compat';
import { LogicFlow } from '../..';
export type IEllipseProps = {
    x?: number;
    y?: number;
    rx?: number;
    ry?: number;
    className?: string;
} & LogicFlow.CommonTheme;
export declare function Ellipse(props: IEllipseProps): h.JSX.Element;
export default Ellipse;
