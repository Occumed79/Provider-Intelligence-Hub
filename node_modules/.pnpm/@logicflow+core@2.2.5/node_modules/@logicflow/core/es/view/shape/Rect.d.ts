import { createElement as h } from 'preact/compat';
import LogicFlow from '../..';
export type IRectProps = {
    x: number;
    y: number;
    width: number;
    height: number;
    className?: string;
    radius?: LogicFlow.NumberOrPercent;
    [key: string]: any;
};
export declare function Rect(props: IRectProps): h.JSX.Element;
export default Rect;
