import { createElement as h } from 'preact/compat';
import BaseNode from './BaseNode';
import { GraphModel, RectNodeModel } from '../../model';
export type IRectNodeProps = {
    model: RectNodeModel;
    graphModel: GraphModel;
};
export declare class RectNode<P extends IRectNodeProps = IRectNodeProps> extends BaseNode<P> {
    getShape(): h.JSX.Element | null;
}
export default RectNode;
