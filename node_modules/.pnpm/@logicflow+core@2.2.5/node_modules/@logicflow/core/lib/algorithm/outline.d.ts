import { Model, BaseNodeModel, BaseEdgeModel, LineEdgeModel, BezierEdgeModel, PolylineEdgeModel } from '../model';
import OutlineInfo = Model.OutlineInfo;
export declare const getNodeOutline: (node: BaseNodeModel) => OutlineInfo;
export declare const getLineOutline: (edge: LineEdgeModel) => OutlineInfo;
export declare const getPolylineOutline: (edge: PolylineEdgeModel) => OutlineInfo;
export declare const getBezierOutline: (edge: BezierEdgeModel) => OutlineInfo;
export declare const getEdgeOutline: (edge: BaseEdgeModel) => OutlineInfo | undefined;
