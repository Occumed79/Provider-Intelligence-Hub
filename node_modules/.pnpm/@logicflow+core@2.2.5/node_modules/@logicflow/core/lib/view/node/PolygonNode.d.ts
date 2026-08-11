import BaseNode from './BaseNode';
import { GraphModel, PolygonNodeModel } from '../../model';
export type IPolygonNodeProps = {
    model: PolygonNodeModel;
    graphModel: GraphModel;
};
export declare class PolygonNode<P extends IPolygonNodeProps = IPolygonNodeProps> extends BaseNode<P> {
    getShape(): import("preact").JSX.Element;
}
export default PolygonNode;
