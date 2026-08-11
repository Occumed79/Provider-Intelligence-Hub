import { NumberExt } from '../../common';
import type { EdgeView } from '../../view/edge';
import type { NodeView } from '../../view/node';
import { ToolItem, type ToolItemOptions } from '../../view/tool';
import type { SimpleAttrs } from '../attr';
export declare class Boundary extends ToolItem<EdgeView | NodeView, Options> {
    static defaults: Options;
    protected onRender(): void;
    update(): this;
}
interface Options extends ToolItemOptions {
    padding?: NumberExt.SideOptions;
    rotate?: boolean;
    useCellGeometry?: boolean;
    attrs?: SimpleAttrs;
}
export {};
