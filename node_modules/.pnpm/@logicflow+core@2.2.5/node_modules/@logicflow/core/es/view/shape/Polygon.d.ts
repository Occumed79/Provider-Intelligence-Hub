import { createElement as h } from 'preact/compat';
import { LogicFlow } from '../..';
export type IPolygonProps = {
    points: LogicFlow.PointTuple[];
    x?: number;
    y?: number;
    className?: string;
    radius?: number;
};
export declare function Polygon(props: IPolygonProps): h.JSX.Element;
export default Polygon;
