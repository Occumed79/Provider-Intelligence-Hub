import { type KeyValue, type Size } from '../common';
import { Point, Polyline } from '../geometry';
import type { PointOptions, PointLike } from '../geometry/point';
import type { CellAttrs, ConnectionPointManualItem, ConnectionPointNativeItem, ConnectorManualItem, ConnectorNativeItem, EdgeAnchorManualItem, EdgeAnchorNativeItem, NodeAnchorManualItem, NodeAnchorNativeItem, RouterManualItem, RouterNativeItem } from '../registry';
import { Registry } from '../registry/registry';
import { type MarkupType } from '../view/markup';
import { Cell, CellConfig, CellMetadata, CellProperties, CellSetOptions, CellDefaults, CellTranslateOptions, CellCommon, CellChangeArgs } from './cell';
import type { Node } from './node';
import type { Store } from './store';
export declare class Edge<Properties extends EdgeProperties = EdgeProperties> extends Cell<Properties> {
    static toStringTag: string;
    static defaultLabel: {
        markup: {
            tagName: string;
            selector: string;
        }[];
        attrs: {
            text: {
                fill: string;
                fontSize: number;
                textAnchor: string;
                textVerticalAnchor: string;
                pointerEvents: string;
            };
            rect: {
                ref: string;
                fill: string;
                rx: number;
                ry: number;
                refWidth: number;
                refHeight: number;
                refX: number;
                refY: number;
            };
        };
        position: {
            distance: number;
        };
    };
    static parseStringLabel(text: string): EdgeLabel;
    static isEdge(instance: any): instance is Edge;
    static registry: Registry<Definition, never, EdgeConfig & {
        inherit?: string | Definition;
    }>;
    static equalTerminals(a: TerminalData, b: TerminalData): boolean;
    static define(config: EdgeConfig): Definition;
    static create(options: EdgeMetadata): Edge<EdgeProperties>;
    protected static defaults: EdgeDefaults;
    protected readonly store: Store<EdgeProperties>;
    protected get [Symbol.toStringTag](): string;
    constructor(metadata?: EdgeMetadata);
    protected preprocess(metadata: EdgeMetadata, ignoreIdCheck?: boolean): Properties;
    protected setup(): void;
    isEdge(): this is Edge;
    disconnect(options?: EdgeSetOptions): this;
    get source(): TerminalData;
    set source(data: TerminalData);
    getSource(): TerminalData;
    getSourceCellId(): string;
    getSourcePortId(): string;
    setSource(node: Node, args?: SetCellTerminalArgs, options?: EdgeSetOptions): this;
    setSource(edge: Edge, args?: SetEdgeTerminalArgs, options?: EdgeSetOptions): this;
    setSource(point: Point | PointOptions, args?: SetTerminalCommonArgs, options?: EdgeSetOptions): this;
    setSource(args: TerminalData, options?: EdgeSetOptions): this;
    get target(): TerminalData;
    set target(data: TerminalData);
    getTarget(): TerminalData;
    getTargetCellId(): string;
    getTargetPortId(): string;
    setTarget(edge: Node, args?: SetCellTerminalArgs, options?: EdgeSetOptions): this;
    setTarget(edge: Edge, args?: SetEdgeTerminalArgs, options?: EdgeSetOptions): this;
    setTarget(point: Point | PointOptions, args?: SetTerminalCommonArgs, options?: EdgeSetOptions): this;
    setTarget(args: TerminalData, options?: EdgeSetOptions): this;
    getTerminal(type: TerminalType): TerminalData;
    setTerminal(type: TerminalType, terminal: Node | Edge | Point | PointOptions | TerminalData, args?: SetTerminalCommonArgs | EdgeSetOptions, options?: EdgeSetOptions): this;
    getSourcePoint(): Point;
    getTargetPoint(): Point;
    protected getTerminalPoint(type: TerminalType): Point;
    getSourceCell(): Cell<CellProperties>;
    getTargetCell(): Cell<CellProperties>;
    protected getTerminalCell(type: TerminalType): Cell<CellProperties>;
    getSourceNode(): Node<import("./node").NodeProperties>;
    getTargetNode(): Node<import("./node").NodeProperties>;
    protected getTerminalNode(type: TerminalType): Node | null;
    get router(): RouterData | undefined;
    set router(data: RouterData | undefined);
    getRouter(): RouterData;
    setRouter(name: string, args?: KeyValue, options?: EdgeSetOptions): this;
    setRouter(router: RouterData, options?: EdgeSetOptions): this;
    removeRouter(options?: EdgeSetOptions): this;
    get connector(): ConnectorData | undefined;
    set connector(data: ConnectorData | undefined);
    getConnector(): any;
    setConnector(name: string, args?: KeyValue, options?: EdgeSetOptions): this;
    setConnector(connector: ConnectorData, options?: EdgeSetOptions): this;
    removeConnector(options?: EdgeSetOptions): Store<EdgeProperties>;
    getDefaultLabel(): EdgeLabel;
    get labels(): EdgeLabel[];
    set labels(labels: EdgeLabel[]);
    getLabels(): EdgeLabel[];
    setLabels(labels: EdgeLabel | EdgeLabel[] | string | string[], options?: EdgeSetOptions): this;
    insertLabel(label: EdgeLabel | string, index?: number, options?: EdgeSetOptions): this;
    appendLabel(label: EdgeLabel | string, options?: EdgeSetOptions): this;
    getLabelAt(index: number): EdgeLabel;
    setLabelAt(index: number, label: EdgeLabel | string, options?: EdgeSetOptions): this;
    removeLabelAt(index: number, options?: EdgeSetOptions): EdgeLabel;
    protected parseLabel(label: string | EdgeLabel): EdgeLabel;
    protected onLabelsChanged({ previous, current, }: CellChangeArgs<EdgeLabel[]>): void;
    get vertices(): PointOptions | PointOptions[];
    set vertices(vertices: PointOptions | PointOptions[]);
    getVertices(): any[];
    setVertices(vertices: PointOptions | PointOptions[], options?: EdgeSetOptions): this;
    insertVertex(vertice: PointOptions, index?: number, options?: EdgeSetOptions): this;
    appendVertex(vertex: PointOptions, options?: EdgeSetOptions): this;
    getVertexAt(index: number): any;
    setVertexAt(index: number, vertice: PointOptions, options?: EdgeSetOptions): this;
    removeVertexAt(index: number, options?: EdgeSetOptions): this;
    protected onVertexsChanged({ previous, current, }: CellChangeArgs<PointLike[]>): void;
    getDefaultMarkup(): any;
    getMarkup(): any;
    /**
     * Translate the edge vertices (and source and target if they are points)
     * by `tx` pixels in the x-axis and `ty` pixels in the y-axis.
     */
    translate(tx: number, ty: number, options?: CellTranslateOptions): this;
    /**
     * Scales the edge's points (vertices) relative to the given origin.
     */
    scale(sx: number, sy: number, origin?: Point | PointOptions, options?: EdgeSetOptions): this;
    protected applyToPoints(worker: (p: PointLike) => PointLike, options?: EdgeSetOptions): this;
    getBBox(): import("../geometry").Rectangle;
    getConnectionPoint(): Point;
    getPolyline(): Polyline;
    updateParent(options?: EdgeSetOptions): Cell<CellProperties>;
    hasLoop(options?: {
        deep?: boolean;
    }): boolean;
    getFragmentAncestor(): Cell | null;
    isFragmentDescendantOf(cell: Cell): boolean;
}
export type RouterData = RouterNativeItem | RouterManualItem;
export type ConnectorData = ConnectorNativeItem | ConnectorManualItem;
interface EdgeCommon extends CellCommon {
    source?: TerminalData;
    target?: TerminalData;
    router?: RouterData;
    connector?: ConnectorData;
    labels?: EdgeLabel[] | string[];
    defaultLabel?: EdgeLabel;
    vertices?: PointOptions[];
    defaultMarkup?: MarkupType;
}
interface TerminalOptions {
    sourceCell?: Cell | string;
    sourcePort?: string;
    sourcePoint?: PointOptions;
    targetCell?: Cell | string;
    targetPort?: string;
    targetPoint?: PointOptions;
    source?: string | Cell | PointOptions | PointOptions | TerminalPointData | TerminalCellLooseData;
    target?: string | Cell | PointOptions | PointOptions | TerminalPointData | TerminalCellLooseData;
}
export interface EdgeBaseOptions extends EdgeCommon, CellMetadata {
}
export interface EdgeMetadata extends Omit<EdgeBaseOptions, TerminalType>, TerminalOptions {
}
export interface EdgeDefaults extends EdgeCommon, CellDefaults {
}
export interface EdgeProperties extends CellProperties, Omit<EdgeBaseOptions, 'tools'> {
}
export interface EdgeConfig extends Omit<EdgeDefaults, TerminalType>, TerminalOptions, CellConfig<EdgeMetadata, Edge> {
}
export interface EdgeSetOptions extends CellSetOptions {
}
export type TerminalType = 'source' | 'target';
export interface SetTerminalCommonArgs {
    selector?: string;
    magnet?: string;
    connectionPoint?: string | ConnectionPointNativeItem | ConnectionPointManualItem;
}
export type NodeAnchorItem = string | NodeAnchorNativeItem | NodeAnchorManualItem;
export type EdgeAnchorItem = string | EdgeAnchorNativeItem | EdgeAnchorManualItem;
export interface SetCellTerminalArgs extends SetTerminalCommonArgs {
    port?: string;
    priority?: boolean;
    anchor?: NodeAnchorItem;
}
export interface SetEdgeTerminalArgs extends SetTerminalCommonArgs {
    anchor?: EdgeAnchorItem;
}
export interface TerminalPointData extends SetTerminalCommonArgs, PointLike {
}
export interface TerminalCellData extends SetCellTerminalArgs {
    cell: string;
    port?: string;
}
export interface TerminalCellLooseData extends SetCellTerminalArgs {
    cell: string | Cell;
    port?: string;
}
export type TerminalData = TerminalPointData | TerminalCellLooseData;
export interface EdgeLabel extends KeyValue {
    markup?: MarkupType;
    attrs?: CellAttrs;
    /**
     * If the distance is in the `[0,1]` range (inclusive), then the position
     * of the label is defined as a percentage of the total length of the edge
     * (the normalized length). For example, passing the number `0.5` positions
     * the label to the middle of the edge.
     *
     * If the distance is larger than `1` (exclusive), the label will be
     * positioned distance pixels away from the beginning of the path along
     * the edge.
     *
     * If the distance is a negative number, the label will be positioned
     * distance pixels away from the end of the path along the edge.
     */
    position?: LabelPosition;
    size?: Size;
}
export interface LabelPositionOptions {
    /**
     * Forces absolute coordinates for distance.
     */
    absoluteDistance?: boolean;
    /**
     * Forces reverse absolute coordinates (if absoluteDistance = true)
     */
    reverseDistance?: boolean;
    /**
     * Forces absolute coordinates for offset.
     */
    absoluteOffset?: boolean;
    /**
     * Auto-adjusts the angle of the label to match path gradient at position.
     */
    keepGradient?: boolean;
    /**
     * Whether rotates labels so they are never upside-down.
     */
    ensureLegibility?: boolean;
}
export interface LabelPositionObject {
    distance: number;
    offset?: number | {
        x?: number;
        y?: number;
    };
    angle?: number;
    options?: LabelPositionOptions;
}
export type LabelPosition = number | LabelPositionObject;
type EdgeClass = typeof Edge;
export interface Definition extends EdgeClass {
    new <T extends EdgeProperties = EdgeProperties>(metadata: T): Edge;
}
export {};
