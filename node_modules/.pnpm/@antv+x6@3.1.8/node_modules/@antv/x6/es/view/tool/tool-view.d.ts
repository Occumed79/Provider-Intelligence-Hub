import { type EdgeToolManualItem, type EdgeToolNativeItem, type EdgeToolNativeNames, type NodeToolManualItem, type NodeToolNativeItem, type NodeToolNativeNames } from '../../registry/tool';
import { CellView } from '../cell';
import { View } from '../view';
import { ToolItem } from './tool-item';
export interface ToolsViewOptions extends ToolsViewConfigOptions {
    className?: string;
}
export interface ToolsViewConfigOptions {
    view?: CellView;
    name?: string;
    local?: boolean;
    items?: (ToolItem | string | NodeToolNativeNames | NodeToolNativeItem | NodeToolManualItem | EdgeToolNativeNames | EdgeToolNativeItem | EdgeToolManualItem)[] | null;
}
export interface ToolsViewUpdateOptions {
    toolId?: string;
}
export declare class ToolsView extends View {
    static toStringTag: string;
    static isToolsView(instance: any): instance is ToolsView;
    tools: ToolItem[] | null;
    options: ToolsViewOptions;
    cellView: CellView;
    svgContainer: SVGGElement;
    htmlContainer: HTMLDivElement;
    get name(): string;
    get graph(): import("../..").Graph;
    get cell(): import("../..").Cell<import("../..").CellProperties>;
    protected get [Symbol.toStringTag](): string;
    constructor(options?: ToolsViewOptions);
    protected createContainer(svg: boolean, options: ToolsViewOptions): HTMLElement | SVGElement;
    config(options: ToolsViewConfigOptions): this;
    update(options?: ToolsViewUpdateOptions): this;
    focus(focusedTool: ToolItem | null): this;
    blur(blurredTool: ToolItem | null): this;
    hide(): this;
    show(): this;
    remove(): this;
    mount(): this;
}
export declare const ToolsViewToStringTag: string;
