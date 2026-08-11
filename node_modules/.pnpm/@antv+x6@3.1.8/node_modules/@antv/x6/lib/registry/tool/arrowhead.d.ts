import { Dom } from '../../common';
import type { TerminalType } from '../../model/edge';
import type { EdgeView } from '../../view/edge';
import { ToolItem, type ToolItemOptions } from '../../view/tool';
import type { SimpleAttrs } from '../attr';
declare class Arrowhead extends ToolItem<EdgeView, Options> {
    static defaults: Options;
    protected get type(): TerminalType;
    protected get ratio(): number;
    protected init(): void;
    protected onRender(): void;
    update(): this;
    protected onMouseDown(evt: Dom.MouseDownEvent): void;
    protected onMouseMove(evt: Dom.MouseMoveEvent): void;
    protected onMouseUp(evt: Dom.MouseUpEvent): void;
}
interface Options extends ToolItemOptions {
    attrs?: SimpleAttrs;
    type?: TerminalType;
    ratio?: number;
}
export declare class SourceArrowhead extends Arrowhead {
    static defaults: Options;
}
export declare class TargetArrowhead extends Arrowhead {
    static defaults: Options;
}
export {};
