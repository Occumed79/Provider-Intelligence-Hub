import BaseNode from './BaseNode';
import { GraphModel, TextNodeModel } from '../../model';
export type ITextNodeProps = {
    model: TextNodeModel;
    graphModel: GraphModel;
};
export declare class TextNode<P extends ITextNodeProps = ITextNodeProps> extends BaseNode<P> {
    getBackground(): import("preact").JSX.Element;
    getResizeControl(): null;
    getShape(): import("preact").JSX.Element;
}
export default TextNode;
