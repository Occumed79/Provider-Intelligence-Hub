import { createElement as h } from 'preact/compat';
import { LogicFlow } from '../..';
export type ICircleProps = {
    x?: number;
    y?: number;
    r?: number;
    className?: string;
} & LogicFlow.CommonTheme;
export declare function Circle(props: ICircleProps): h.JSX.Element;
export default Circle;
