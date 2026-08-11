import { Node } from '../../model';
import { TransformImplEventArgs } from './transform';
declare module '../../graph/graph' {
    interface Graph {
        createTransformWidget: (node: Node) => Graph;
        clearTransformWidgets: () => Graph;
    }
}
declare module '../../graph/events' {
    interface EventArgs extends TransformImplEventArgs {
    }
}
