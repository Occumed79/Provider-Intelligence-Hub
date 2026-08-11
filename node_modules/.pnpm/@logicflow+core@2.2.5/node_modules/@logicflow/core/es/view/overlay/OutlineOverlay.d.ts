import { Component } from 'preact/compat';
import { GraphModel, LineEdgeModel, BezierEdgeModel, PolylineEdgeModel } from '../../model';
type IProps = {
    graphModel: GraphModel;
};
export declare class OutlineOverlay extends Component<IProps> {
    private renderRectOutline;
    getNodesOutline(): any;
    getEdgeOutline(): any;
    getLineOutline(line: LineEdgeModel): import("preact/compat").JSX.Element;
    getPolylineOutline(polyline: PolylineEdgeModel): import("preact/compat").JSX.Element;
    getBezierOutline(bezier: BezierEdgeModel): import("preact/compat").JSX.Element;
    render(): import("preact/compat").JSX.Element;
}
export default OutlineOverlay;
