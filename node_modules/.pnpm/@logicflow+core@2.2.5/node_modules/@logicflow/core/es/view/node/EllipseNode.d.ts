import BaseNode from './BaseNode';
import { GraphModel, EllipseNodeModel } from '../../model';
export type IEllipseNodeProps = {
    model: EllipseNodeModel;
    graphModel: GraphModel;
};
export declare class EllipseNode<P extends IEllipseNodeProps = IEllipseNodeProps> extends BaseNode<P> {
    getShape(): import("preact").JSX.Element;
}
export default EllipseNode;
