import type { DeepPartial, Omit } from 'utility-types';
import { type KeyValue, NumberExt, type Size } from '../common';
import { Point, type PointLike, Rectangle, type RectangleLike } from '../geometry';
import { Registry } from '../registry/registry';
import { type MarkupType } from '../view/markup';
import type { KeyframeEffectOptions } from './animation';
import { Cell, type CellCommon, type CellConfig, type CellDefaults, type CellMetadata, type CellProperties, type CellSetOptions, type CellTranslateOptions } from './cell';
import type { Edge, TerminalType } from './edge';
import type { Metadata as PMetadata, PortMetadata } from './port';
import { PortManager } from './port';
import type { Store } from './store';
export declare class Node<Properties extends NodeProperties = NodeProperties> extends Cell<Properties> {
    static toStringTag: string;
    static isNode(instance: any): instance is Node;
    static registry: Registry<NodeDefinition, never, NodeConfig & {
        inherit?: string | NodeDefinition;
    }>;
    static define(config: NodeConfig): typeof Node;
    static create(options: NodeMetadata): Node<NodeProperties>;
    protected static defaults: Defaults;
    protected readonly store: Store<NodeProperties>;
    protected port: PortManager;
    protected get [Symbol.toStringTag](): string;
    constructor(metadata?: NodeMetadata);
    protected preprocess(metadata: NodeMetadata, ignoreIdCheck?: boolean): Properties;
    isNode(): this is Node;
    size(): Size;
    size(size: Size, options?: ResizeOptions): this;
    size(width: number, height: number, options?: ResizeOptions): this;
    getSize(): {
        width: number;
        height: number;
    };
    setSize(size: Size, options?: ResizeOptions): this;
    setSize(width: number, height: number, options?: ResizeOptions): this;
    resize(width: number, height: number, options?: ResizeOptions): this;
    scale(sx: number, sy: number, origin?: PointLike | null, options?: NodeSetOptions): this;
    position(x: number, y: number, options?: SetPositionOptions): this;
    position(options?: GetPositionOptions): PointLike;
    getPosition(options?: GetPositionOptions): PointLike;
    setPosition(p: Point | PointLike, options?: SetPositionOptions): this;
    setPosition(x: number, y: number, options?: SetPositionOptions): this;
    translate(tx?: number, ty?: number, options?: TranslateOptions): this;
    angle(): number;
    angle(val: number, options?: RotateOptions): this;
    getAngle(): number;
    rotate(angle: number, options?: RotateOptions): this;
    getBBox(options?: {
        deep?: boolean;
    }): Rectangle;
    getConnectionPoint(edge: Edge, type: TerminalType): Point;
    /**
     * Sets cell's size and position based on the children bbox and given padding.
     */
    fit(options?: FitEmbedsOptions): this;
    get portContainerMarkup(): MarkupType;
    set portContainerMarkup(markup: MarkupType);
    getDefaultPortContainerMarkup(): MarkupType;
    getPortContainerMarkup(): MarkupType;
    setPortContainerMarkup(markup?: MarkupType, options?: NodeSetOptions): this;
    get portMarkup(): MarkupType;
    set portMarkup(markup: MarkupType);
    getDefaultPortMarkup(): MarkupType;
    getPortMarkup(): MarkupType;
    setPortMarkup(markup?: MarkupType, options?: NodeSetOptions): this;
    get portLabelMarkup(): MarkupType;
    set portLabelMarkup(markup: MarkupType);
    getDefaultPortLabelMarkup(): MarkupType;
    getPortLabelMarkup(): MarkupType;
    setPortLabelMarkup(markup?: MarkupType, options?: NodeSetOptions): this;
    get ports(): PMetadata;
    getPorts(): PortMetadata[];
    getPortsByGroup(groupName: string): PortMetadata[];
    getPort(portId: string): PortMetadata;
    getPortAt(index: number): PortMetadata;
    hasPorts(): boolean;
    hasPort(portId: string): boolean;
    getPortIndex(port: PortMetadata | string): number;
    getPortsPosition(groupName: string): KeyValue<{
        position: PointLike;
        angle: number;
    }>;
    getPortProp(portId: string): PortMetadata;
    getPortProp<T>(portId: string, path: string | string[]): T;
    setPortProp(portId: string, path: string | string[], value: any, options?: NodeSetOptions): this;
    setPortProp(portId: string, value: DeepPartial<PortMetadata>, options?: NodeSetOptions): this;
    removePortProp(portId: string, options?: NodeSetOptions): this;
    removePortProp(portId: string, path: string | string[], options?: NodeSetOptions): this;
    portProp(portId: string): PortMetadata;
    portProp<T>(portId: string, path: string | string[]): T;
    portProp(portId: string, path: string | string[], value: any, options?: NodeSetOptions): this;
    portProp(portId: string, value: DeepPartial<PortMetadata>, options?: NodeSetOptions): this;
    protected prefixPortPath(portId: string, path?: string | string[]): string | string[];
    addPort(port: PortMetadata, options?: NodeSetOptions): this;
    addPorts(ports: PortMetadata[], options?: NodeSetOptions): this;
    insertPort(index: number, port: PortMetadata, options?: NodeSetOptions): this;
    removePort(port: PortMetadata | string, options?: NodeSetOptions): this;
    removePortAt(index: number, options?: NodeSetOptions): this;
    removePorts(options?: NodeSetOptions): this;
    removePorts(portsForRemoval: (PortMetadata | string)[], options?: NodeSetOptions): this;
    getParsedPorts(): import("./port").Port[];
    getParsedGroups(): {
        [name: string]: import("./port").Group;
    };
    getPortsLayoutByGroup(groupName: string | undefined, bbox: Rectangle): import("./port").LayoutResult[];
    protected initPorts(): void;
    protected processRemovedPort(): void;
    protected validatePorts(): string[];
    protected generatePortId(): string;
    protected updatePortData(): void;
}
interface Common extends CellCommon {
    size?: {
        width: number;
        height: number;
    };
    position?: {
        x: number;
        y: number;
    };
    angle?: number;
    ports?: Partial<PMetadata> | PortMetadata[];
    portContainerMarkup?: MarkupType;
    portMarkup?: MarkupType;
    portLabelMarkup?: MarkupType;
    defaultPortMarkup?: MarkupType;
    defaultPortLabelMarkup?: MarkupType;
    defaultPortContainerMarkup?: MarkupType;
}
interface Boundary {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}
export interface Defaults extends Common, CellDefaults {
}
export interface NodeMetadata extends Common, CellMetadata, Boundary {
}
export interface NodeProperties extends Common, Omit<CellMetadata, 'tools'>, CellProperties {
}
export interface NodeConfig extends Defaults, Boundary, CellConfig<NodeMetadata, Node> {
}
export interface NodeSetOptions extends CellSetOptions {
}
export interface GetPositionOptions {
    relative?: boolean;
}
export interface SetPositionOptions extends NodeSetOptions {
    deep?: boolean;
    relative?: boolean;
}
export interface TranslateOptions extends CellTranslateOptions {
    transition?: boolean | KeyframeEffectOptions;
    restrict?: RectangleLike | null;
    exclude?: Cell[];
}
export interface RotateOptions extends NodeSetOptions {
    absolute?: boolean;
    center?: PointLike | null;
}
export type ResizeDirection = 'left' | 'top' | 'right' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export interface ResizeOptions extends NodeSetOptions {
    absolute?: boolean;
    direction?: ResizeDirection;
}
export interface FitEmbedsOptions extends NodeSetOptions {
    deep?: boolean;
    padding?: NumberExt.SideOptions;
}
type NodeClass = typeof Node;
export interface NodeDefinition extends NodeClass {
    new <T extends NodeProperties = NodeProperties>(metadata: T): Node;
}
export {};
