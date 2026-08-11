import { createElement as h } from 'preact/compat';
export type ILineProps = {
    id?: string;
    tabindex?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    stroke?: string;
    className?: string;
    style?: h.JSX.CSSProperties;
    [key: string]: any;
};
export declare function Line(props: ILineProps): h.JSX.Element;
export default Line;
