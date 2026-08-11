import { Basecoat, type KeyValue } from '../../common';
import type { EventArgs, Graph, GraphPlugin } from '../../graph';
import type { Node } from '../../model';
import type { TransformImplOptions, TransformImplEventArgs } from './transform';
import { TransformImpl } from './transform';
import './api';
type OptionItem<T, S> = S | ((this: Graph, arg: T) => S);
interface ResizingRaw {
    enabled?: boolean;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    orthogonal?: boolean;
    restrict?: boolean | number;
    autoScroll?: boolean;
    preserveAspectRatio?: boolean;
    allowReverse?: boolean;
}
interface RotatingRaw {
    enabled?: boolean;
    grid?: number;
}
type Resizing = {
    [K in keyof ResizingRaw]?: OptionItem<Node, ResizingRaw[K]>;
};
type Rotating = {
    [K in keyof RotatingRaw]?: OptionItem<Node, RotatingRaw[K]>;
};
type Options = {
    rotating?: boolean | Partial<Rotating>;
    resizing?: boolean | Partial<Resizing>;
};
export declare class Transform extends Basecoat<TransformImplEventArgs> implements GraphPlugin {
    name: string;
    options: Options;
    private graph;
    protected widgets: Map<Node, TransformImpl>;
    private disabled;
    constructor(options?: Options);
    init(graph: Graph): void;
    protected startListening(): void;
    protected stopListening(): void;
    enable(): void;
    disable(): void;
    isEnabled(): boolean;
    createWidget(node: Node): void;
    protected onNodeClick({ node }: EventArgs['node:click']): void;
    protected onBlankMouseDown(): void;
    protected createTransform(node: Node): TransformImpl;
    protected parseOptionGroup<K extends KeyValue, S extends KeyValue = KeyValue, T = any>(graph: Graph, arg: T, options: S): K;
    protected getTransformOptions(node: Node): TransformImplOptions;
    clearWidgets(): void;
    dispose(): void;
}
export {};
