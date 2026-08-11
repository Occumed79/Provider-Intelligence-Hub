import { createElement as h } from 'preact/compat';
export type IPolylineProps = {
    points: string;
    pathLength?: number | 'none';
    className?: string;
};
export declare function Polyline(props: IPolylineProps): h.JSX.Element;
export default Polyline;
