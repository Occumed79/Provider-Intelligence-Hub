import { type JSONObject, type KeyValue, type Size } from '../common';
import { Point, type Rectangle } from '../geometry';
import { type CellAttrs, type PortLabelLayoutManualItem, type PortLabelLayoutNativeItem, type PortLabelLayoutNativeNames, type PortLabelLayoutResult, type PortLayoutManualItem, type PortLayoutNativeItem, type PortLayoutNativeNames, type PortLayoutResult } from '../registry';
import type { MarkupType } from '../view/markup';
import type { PointData } from '../types';
export interface Metadata {
    groups?: {
        [name: string]: GroupMetadata;
    };
    items: PortMetadata[];
}
export type PortPosition = Partial<PortLayoutNativeItem> | Partial<PortLayoutManualItem>;
export type PortPositionMetadata = PortLayoutNativeNames | Exclude<string, PortLayoutNativeNames> | PointData | PortPosition;
export type PortLabelPosition = Partial<PortLabelLayoutNativeItem> | Partial<PortLabelLayoutManualItem>;
export type PortLabelPositionMetadata = PortLabelLayoutNativeNames | Exclude<string, PortLabelLayoutNativeNames> | PortLabelPosition;
export interface LabelMetadata {
    markup?: MarkupType;
    size?: Size;
    position?: PortLabelPositionMetadata;
}
export interface Label {
    markup: string;
    size?: Size;
    position: PortLabelPosition;
}
interface Common {
    markup: MarkupType;
    attrs: CellAttrs;
    zIndex: number | 'auto';
    size?: Size;
}
export interface GroupMetadata extends Partial<Common>, KeyValue {
    label?: LabelMetadata;
    position?: PortPositionMetadata;
}
export interface Group extends Partial<Common> {
    label: Label;
    position: PortPosition;
}
interface PortBase {
    group?: string;
    /**
     * Arguments for the port layout function.
     */
    args?: JSONObject;
}
export interface PortMetadata extends Partial<Common>, PortBase, KeyValue {
    id?: string;
    label?: LabelMetadata;
}
export interface Port extends Group, PortBase {
    id: string;
}
export interface LayoutResult {
    portId: string;
    portAttrs?: CellAttrs;
    portSize?: Size;
    portLayout: PortLayoutResult;
    labelSize?: Size;
    labelLayout: PortLabelLayoutResult | null;
}
export declare class PortManager {
    ports: Port[];
    groups: {
        [name: string]: Group;
    };
    constructor(data: Metadata);
    getPorts(): Port[];
    getGroup(groupName?: string | null): Group;
    getPortsByGroup(groupName?: string): Port[];
    getPortsLayoutByGroup(groupName: string | undefined, elemBBox: Rectangle): LayoutResult[];
    protected init(data: Metadata): void;
    protected parseGroup(group: GroupMetadata): Group;
    protected parsePort(port: PortMetadata): {
        [key: string]: any;
        id?: string;
        label?: LabelMetadata;
        markup?: MarkupType;
        attrs?: CellAttrs;
        zIndex?: number | "auto";
        size?: Size;
        group?: string;
        /**
         * Arguments for the port layout function.
         */
        args?: JSONObject;
    };
    protected getZIndex(group: Group, port: PortMetadata): number | "auto";
    protected createPosition(group: Group, port: PortMetadata): PortPosition;
    protected getPortPosition(position?: PortPositionMetadata, setDefault?: boolean): PortPosition;
    protected getPortLabelPosition(position?: PortLabelPositionMetadata, setDefault?: boolean): PortLabelPosition;
    protected getLabel(item: GroupMetadata, setDefaults?: boolean): Label;
    protected getPortLabelLayout(port: Port, portPosition: Point, elemBBox: Rectangle): PortLabelLayoutResult;
}
export {};
