import BaseNode from './BaseNode';
import { GraphModel, CircleNodeModel } from '../../model';
export type ICircleNodeProps = {
    model: CircleNodeModel;
    graphModel: GraphModel;
};
export declare class CircleNode<P extends ICircleNodeProps = ICircleNodeProps> extends BaseNode<P> {
    getShape(): import("preact").JSX.Element;
}
export default CircleNode;
