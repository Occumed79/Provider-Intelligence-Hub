import { Node, NodeProperties, NodeSetOptions } from '../model';
export declare const BaseBodyAttr: {
    fill: string;
    stroke: string;
    strokeWidth: number;
};
export declare const BaseLabelAttr: {
    fontSize: number;
    fill: string;
    refX: number;
    refY: number;
    textAnchor: string;
    textVerticalAnchor: string;
    fontFamily: string;
};
export declare class Base<Properties extends NodeProperties = NodeProperties> extends Node<Properties> {
    get label(): string | undefined | null;
    set label(val: string | undefined | null);
    getLabel(): string;
    setLabel(label?: string | null, options?: NodeSetOptions): this;
    removeLabel(): this;
}
