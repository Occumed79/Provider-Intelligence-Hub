import BaseNode from './BaseNode';
import { GraphModel, DiamondNodeModel } from '../../model';
export type IDiamondNodeProps = {
    model: DiamondNodeModel;
    graphModel: GraphModel;
};
export declare class DiamondNode<P extends IDiamondNodeProps = IDiamondNodeProps> extends BaseNode<P> {
    getShape(): import("preact").JSX.Element;
}
export default DiamondNode;
