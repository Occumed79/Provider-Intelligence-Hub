/** biome-ignore-all lint/complexity/noThisInStatic: <存量的问题biome修了运行的实际效果就变了，所以先忽略> */
import type { NonUndefined } from 'utility-types';
import { Basecoat, type KeyValue, type Size } from '../common';
import { Point, type PointLike, Rectangle } from '../geometry';
import type { Graph } from '../graph';
import { type AttrDefinitions, type CellAttrs, type ComplexAttrValue } from '../registry';
import type { CellView } from '../view';
import type { MarkupType } from '../view/markup';
import { Animation, AnimationManager, type AnimationPlaybackEvent, type KeyframeEffectOptions } from './animation';
import type { ConnectorData, Edge, EdgeLabel, EdgeProperties, RouterData, TerminalData, TerminalType } from './edge';
import type { BatchName, Model } from './model';
import type { Node, NodeProperties, NodeSetOptions } from './node';
import type { Port } from './port';
import type { StoreMutateOptions, StoreSetByPathOptions, StoreSetOptions } from './store';
import { Store } from './store';
export declare class Cell<Properties extends CellProperties = CellProperties> extends Basecoat<CellBaseEventArgs> {
    static toStringTag: string;
    static isCell(instance: any): instance is Cell;
    static normalizeTools(raw: ToolsLoose): Tools;
    static getCommonAncestor(...cells: (Cell | null | undefined)[]): Cell | null;
    static getCellsBBox(cells: Cell[], options?: CellGetCellsBBoxOptions): Rectangle;
    static deepClone(cell: Cell): KeyValue<Cell<CellProperties>>;
    static cloneCells(cells: Cell[]): KeyValue<Cell<CellProperties>>;
    protected static markup: MarkupType;
    protected static defaults: CellDefaults;
    protected static attrHooks: AttrDefinitions;
    protected static propHooks: CellPropHook[];
    static config<C extends CellConfig = CellConfig>(presets: C): void;
    static getMarkup(): MarkupType;
    static getDefaults<T extends CellDefaults = CellDefaults>(raw?: boolean): T;
    static getAttrHooks(): AttrDefinitions;
    static applyPropHooks(cell: Cell, metadata: CellMetadata): CellMetadata;
    static generateId(metadata?: CellMetadata): string;
    protected get [Symbol.toStringTag](): string;
    readonly id: string;
    protected readonly store: Store<CellProperties>;
    protected readonly animationManager: AnimationManager;
    protected _model: Model | null;
    protected _parent: Cell | null;
    protected _children: Cell[] | null;
    constructor(metadata?: CellMetadata);
    init(): void;
    get model(): Model | null;
    set model(model: Model | null);
    protected preprocess(metadata: CellMetadata, ignoreIdCheck?: boolean): Properties;
    protected postprocess(metadata: CellMetadata): void;
    protected setup(): void;
    notify<Key extends keyof CellBaseEventArgs>(name: Key, args: CellBaseEventArgs[Key]): this;
    notify(name: Exclude<string, keyof CellBaseEventArgs>, args: any): this;
    isNode(): this is Node;
    isEdge(): this is Edge;
    isSameStore(cell: Cell): boolean;
    get view(): string;
    get shape(): string;
    getProp(): Properties;
    getProp<K extends keyof Properties>(key: K): Properties[K];
    getProp<K extends keyof Properties>(key: K, defaultValue: Properties[K]): NonUndefined<Properties[K]>;
    getProp<T>(key: string): T;
    getProp<T>(key: string, defaultValue: T): T;
    setProp<K extends keyof Properties>(key: K, value: Properties[K] | null | undefined | void, options?: CellSetOptions): this;
    setProp(key: string, value: any, options?: CellSetOptions): this;
    setProp(props: Partial<Properties>, options?: CellSetOptions): this;
    removeProp<K extends keyof Properties>(key: K | K[], options?: CellSetOptions): this;
    removeProp(key: string | string[], options?: CellSetOptions): this;
    removeProp(options?: CellSetOptions): this;
    hasChanged(): boolean;
    hasChanged<K extends keyof Properties>(key: K | null): boolean;
    hasChanged(key: string | null): boolean;
    getPropByPath<T>(path: string | string[]): T;
    setPropByPath(path: string | string[], value: any, options?: SetByPathOptions): this;
    removePropByPath(path: string | string[], options?: CellSetOptions): this;
    prop(): Properties;
    prop<K extends keyof Properties>(key: K): Properties[K];
    prop<T>(key: string): T;
    prop<T>(path: string[]): T;
    prop<K extends keyof Properties>(key: K, value: Properties[K] | null | undefined | void, options?: CellSetOptions): this;
    prop(key: string, value: any, options?: CellSetOptions): this;
    prop(path: string[], value: any, options?: CellSetOptions): this;
    prop(props: Partial<Properties>, options?: CellSetOptions): this;
    previous<K extends keyof Properties>(name: K): Properties[K] | undefined;
    previous<T>(name: string): T | undefined;
    get zIndex(): number | undefined | null;
    set zIndex(z: number | undefined | null);
    getZIndex(): number;
    setZIndex(z: number, options?: CellSetOptions): this;
    removeZIndex(options?: CellSetOptions): this;
    toFront(options?: ToFrontOptions): this;
    toBack(options?: ToBackOptions): this;
    get markup(): MarkupType | undefined | null;
    set markup(value: MarkupType | undefined | null);
    getMarkup(): MarkupType;
    setMarkup(markup: MarkupType, options?: CellSetOptions): this;
    removeMarkup(options?: CellSetOptions): this;
    get attrs(): CellAttrs | null | undefined;
    set attrs(value: CellAttrs | null | undefined);
    getAttrs(): {
        [selector: string]: import("../registry").ComplexAttrs;
    };
    setAttrs(attrs: CellAttrs | null | undefined, options?: SetAttrOptions): this;
    replaceAttrs(attrs: CellAttrs, options?: CellSetOptions): this;
    updateAttrs(attrs: CellAttrs, options?: CellSetOptions): this;
    removeAttrs(options?: CellSetOptions): this;
    getAttrDefinition(attrName: string): import("../registry").AttrDefinition;
    getAttrByPath(): CellAttrs;
    getAttrByPath<T>(path: string | string[]): T;
    setAttrByPath(path: string | string[], value: ComplexAttrValue, options?: CellSetOptions): this;
    removeAttrByPath(path: string | string[], options?: CellSetOptions): this;
    protected prefixAttrPath(path: string | string[]): string | string[];
    attr(): CellAttrs;
    attr<T>(path: string | string[]): T;
    attr(path: string | string[], value: ComplexAttrValue | null, options?: CellSetOptions): this;
    attr(attrs: CellAttrs, options?: SetAttrOptions): this;
    get visible(): boolean;
    set visible(value: boolean);
    setVisible(visible: boolean, options?: CellSetOptions): this;
    isVisible(): boolean;
    show(options?: CellSetOptions): this;
    hide(options?: CellSetOptions): this;
    toggleVisible(visible: boolean, options?: CellSetOptions): this;
    toggleVisible(options?: CellSetOptions): this;
    get data(): Properties['data'];
    set data(val: Properties['data']);
    getData<T = Properties['data']>(): T;
    setData<T = Properties['data']>(data: T, options?: SetDataOptions): this;
    replaceData<T = Properties['data']>(data: T, options?: CellSetOptions): this;
    updateData<T = Properties['data']>(data: T, options?: CellSetOptions): this;
    removeData(options?: CellSetOptions): this;
    get parent(): Cell | null;
    get children(): Cell<CellProperties>[];
    getParentId(): string;
    getParent<T extends Cell = Cell>(): T | null;
    getChildren(): Cell<CellProperties>[];
    hasParent(): boolean;
    isParentOf(child: Cell | null): boolean;
    isChildOf(parent: Cell | null): boolean;
    eachChild(iterator: (child: Cell, index: number, children: Cell[]) => void, context?: any): this;
    filterChild(filter: (cell: Cell, index: number, arr: Cell[]) => boolean, context?: any): Cell[];
    getChildCount(): number;
    getChildIndex(child: Cell): number;
    getChildAt(index: number): Cell<CellProperties>;
    getAncestors(options?: {
        deep?: boolean;
    }): Cell[];
    getDescendants(options?: CellGetDescendantsOptions): Cell[];
    isDescendantOf(ancestor: Cell | null, options?: {
        deep?: boolean;
    }): boolean;
    isAncestorOf(descendant: Cell | null, options?: {
        deep?: boolean;
    }): boolean;
    contains(cell: Cell | null): boolean;
    getCommonAncestor(...cells: (Cell | null | undefined)[]): Cell | null;
    setParent(parent: Cell | null, options?: CellSetOptions): this;
    setChildren(children: Cell[] | null, options?: CellSetOptions): this;
    unembed(child: Cell, options?: CellSetOptions): this;
    embed(child: Cell, options?: CellSetOptions): this;
    addTo(model: Model, options?: CellSetOptions): this;
    addTo(graph: Graph, options?: CellSetOptions): this;
    addTo(parent: Cell, options?: CellSetOptions): this;
    insertTo(parent: Cell, index?: number, options?: CellSetOptions): this;
    addChild(child: Cell | null, options?: CellSetOptions): this;
    insertChild(child: Cell | null, index?: number, options?: CellSetOptions): this;
    removeFromParent(options?: CellRemoveOptions): this;
    removeChild(child: Cell, options?: CellRemoveOptions): Cell<CellProperties>;
    removeChildAt(index: number, options?: CellRemoveOptions): Cell<CellProperties>;
    remove(options?: CellRemoveOptions): this;
    animate(keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions): Animation;
    getAnimations(): Animation[];
    translate(tx: number, ty: number, options?: CellTranslateOptions): this;
    scale(sx: number, // eslint-disable-line
    sy: number, // eslint-disable-line
    origin?: Point | PointLike, // eslint-disable-line
    options?: NodeSetOptions): this;
    addTools(items: ToolItem | ToolItem[], options?: AddToolOptions): void;
    addTools(items: ToolItem | ToolItem[], name: string, options?: AddToolOptions): void;
    setTools(tools?: ToolsLoose | null, options?: CellSetOptions): this;
    getTools(): Tools | null;
    removeTools(options?: CellSetOptions): this;
    hasTools(name?: string): boolean;
    hasTool(name: string): boolean;
    removeTool(name: string, options?: CellSetOptions): this;
    removeTool(index: number, options?: CellSetOptions): this;
    getBBox(options?: {
        deep?: boolean;
    }): Rectangle;
    getConnectionPoint(edge: Edge, type: TerminalType): Point;
    toJSON(options?: CellToJSONOptions): this extends Node ? NodeProperties : this extends Edge ? EdgeProperties : Properties;
    clone(options?: CloneOptions): this extends Node ? Node : this extends Edge ? Edge : Cell;
    findView(graph: Graph): CellView | null;
    startBatch(name: BatchName, data?: KeyValue, model?: Model | null): this;
    stopBatch(name: BatchName, data?: KeyValue, model?: Model | null): this;
    batchUpdate<T>(name: BatchName, execute: () => T, data?: KeyValue): T;
    dispose(): void;
}
export interface CellCommon {
    view?: string;
    shape?: string;
    markup?: MarkupType;
    attrs?: CellAttrs;
    zIndex?: number;
    visible?: boolean;
    data?: any;
}
export interface CellDefaults extends CellCommon {
}
export interface CellMetadata extends CellCommon, KeyValue {
    id?: string;
    tools?: ToolsLoose;
    animation?: AnimateParams[];
}
export interface CellProperties extends CellDefaults, CellMetadata {
    parent?: string;
    children?: string[];
    tools?: Tools;
}
type ToolItem = string | {
    name: string;
    args?: any;
};
export interface Tools {
    name?: string | null;
    local?: boolean;
    items: ToolItem[];
}
export type ToolsLoose = ToolItem | ToolItem[] | Tools;
export interface CellSetOptions extends StoreSetOptions {
}
export interface CellMutateOptions extends StoreMutateOptions {
}
export interface CellRemoveOptions extends CellSetOptions {
    deep?: boolean;
}
export interface SetAttrOptions extends CellSetOptions {
    deep?: boolean;
    overwrite?: boolean;
}
export interface SetDataOptions extends CellSetOptions {
    deep?: boolean;
    overwrite?: boolean;
}
export interface SetByPathOptions extends StoreSetByPathOptions {
}
export interface ToFrontOptions extends CellSetOptions {
    deep?: boolean;
}
export interface ToBackOptions extends ToFrontOptions {
}
export interface CellTranslateOptions extends CellSetOptions {
    tx?: number;
    ty?: number;
    translateBy?: string | number;
}
export interface AddToolOptions extends CellSetOptions {
    reset?: boolean;
    local?: boolean;
}
export interface CellGetDescendantsOptions {
    deep?: boolean;
    breadthFirst?: boolean;
}
export interface CellToJSONOptions {
    diff?: boolean;
}
export interface CloneOptions {
    deep?: boolean;
    keepId?: boolean;
}
export interface KeyframeAnimationOptions extends KeyframeEffectOptions {
    id?: string;
    timeline?: AnimationTimeline | null;
}
export type AnimateParams = Parameters<InstanceType<typeof Cell>['animate']>;
export interface CellBaseEventArgs {
    'animation:finish': AnimationPlaybackEvent;
    'animation:cancel': AnimationPlaybackEvent;
    'change:*': ChangeAnyKeyArgs;
    'change:attrs': CellChangeArgs<CellAttrs>;
    'change:zIndex': CellChangeArgs<number>;
    'change:markup': CellChangeArgs<MarkupType>;
    'change:visible': CellChangeArgs<boolean>;
    'change:parent': CellChangeArgs<string>;
    'change:children': CellChangeArgs<string[]>;
    'change:tools': CellChangeArgs<Tools>;
    'change:view': CellChangeArgs<string>;
    'change:data': CellChangeArgs<any>;
    'change:size': NodeChangeArgs<Size>;
    'change:angle': NodeChangeArgs<number>;
    'change:position': NodeChangeArgs<PointLike>;
    'change:ports': NodeChangeArgs<Port[]>;
    'change:portMarkup': NodeChangeArgs<MarkupType>;
    'change:portLabelMarkup': NodeChangeArgs<MarkupType>;
    'change:portContainerMarkup': NodeChangeArgs<MarkupType>;
    'ports:removed': {
        cell: Cell;
        node: Node;
        removed: Port[];
    };
    'ports:added': {
        cell: Cell;
        node: Node;
        added: Port[];
    };
    'change:source': EdgeChangeArgs<TerminalData>;
    'change:target': EdgeChangeArgs<TerminalData>;
    'change:terminal': EdgeChangeArgs<TerminalData> & {
        type: TerminalType;
    };
    'change:router': EdgeChangeArgs<RouterData>;
    'change:connector': EdgeChangeArgs<ConnectorData>;
    'change:vertices': EdgeChangeArgs<PointLike[]>;
    'change:labels': EdgeChangeArgs<EdgeLabel[]>;
    'change:defaultLabel': EdgeChangeArgs<EdgeLabel>;
    'vertexs:added': {
        cell: Cell;
        edge: Edge;
        added: PointLike[];
    };
    'vertexs:removed': {
        cell: Cell;
        edge: Edge;
        removed: PointLike[];
    };
    'labels:added': {
        cell: Cell;
        edge: Edge;
        added: EdgeLabel[];
    };
    'labels:removed': {
        cell: Cell;
        edge: Edge;
        removed: EdgeLabel[];
    };
    'batch:start': {
        name: BatchName;
        data: KeyValue;
        cell: Cell;
    };
    'batch:stop': {
        name: BatchName;
        data: KeyValue;
        cell: Cell;
    };
    changed: {
        cell: Cell;
        options: CellMutateOptions;
    };
    added: {
        cell: Cell;
        index: number;
        options: CellSetOptions;
    };
    removed: {
        cell: Cell;
        index: number;
        options: CellRemoveOptions;
    };
}
interface ChangeAnyKeyArgs<T extends keyof CellProperties = keyof CellProperties> {
    key: T;
    current: CellProperties[T];
    previous: CellProperties[T];
    options: CellMutateOptions;
    cell: Cell;
}
export interface CellChangeArgs<T> {
    cell: Cell;
    current?: T;
    previous?: T;
    options: CellMutateOptions;
}
interface NodeChangeArgs<T> extends CellChangeArgs<T> {
    node: Node;
}
interface EdgeChangeArgs<T> extends CellChangeArgs<T> {
    edge: Edge;
}
export interface CellGetCellsBBoxOptions {
    deep?: boolean;
}
export type CellDefinition = typeof Cell;
export type CellPropHook<M extends CellMetadata = CellMetadata, C extends Cell = Cell> = (this: C, metadata: M) => M;
export type PropHooks<M extends CellMetadata = CellMetadata, C extends Cell = Cell> = KeyValue<CellPropHook<M, C>> | CellPropHook<M, C> | CellPropHook<M, C>[];
export interface CellConfig<M extends CellMetadata = CellMetadata, C extends Cell = Cell> extends CellDefaults, KeyValue {
    constructorName?: string;
    overwrite?: boolean;
    propHooks?: PropHooks<M, C>;
    attrHooks?: AttrDefinitions;
}
export {};
