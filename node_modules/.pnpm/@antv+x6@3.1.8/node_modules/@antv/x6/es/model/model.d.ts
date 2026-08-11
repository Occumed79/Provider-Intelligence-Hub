import { Basecoat, type KeyValue } from '../common';
import { type DijkstraWeight } from '../common/algorithm';
import { Rectangle, type RectangleLike } from '../geometry';
import type { Graph } from '../graph';
import { Cell, CellGetDescendantsOptions, CellRemoveOptions, CellSetOptions, CellTranslateOptions, CellToJSONOptions, CellProperties, CellGetCellsBBoxOptions } from './cell';
import { Collection } from './collection';
import type { CollectionAddOptions, CollectionSetOptions, CollectionRemoveOptions, CellEventArgs, NodeEventArgs, EdgeEventArgs } from './collection';
import { Edge, EdgeMetadata, EdgeSetOptions, TerminalType } from './edge';
import { Node, NodeMetadata } from './node';
import type { PointLike, KeyPoint } from '../types';
export declare class Model extends Basecoat<ModelEventArgs> {
    static isModel(instance: unknown): instance is Model;
    static toJSON(cells: Cell[], options?: ToJSONOptions): {
        cells: CellProperties[];
    };
    static fromJSON(data: FromJSONData): (Node<import("./node").NodeProperties> | Edge<import("./edge").EdgeProperties>)[];
    readonly collection: Collection;
    protected readonly batches: KeyValue<number>;
    protected readonly addings: WeakMap<Cell, boolean>;
    graph: Graph;
    protected nodes: KeyValue<boolean>;
    protected edges: KeyValue<boolean>;
    protected outgoings: KeyValue<string[]>;
    protected incomings: KeyValue<string[]>;
    constructor(cells?: Cell[]);
    notify<Key extends keyof ModelEventArgs>(name: Key, args: ModelEventArgs[Key]): this;
    notify(name: Exclude<string, keyof ModelEventArgs>, args: unknown): this;
    protected setup(): void;
    protected sortOnChangeZ(): void;
    protected onCellAdded(cell: Cell): void;
    protected onCellRemoved(cell: Cell, options: CollectionRemoveOptions): void;
    protected onReset(cells: Cell[]): void;
    protected onEdgeTerminalChanged(edge: Edge, type: TerminalType): void;
    protected prepareCell(cell: Cell, options: CollectionAddOptions): Cell<CellProperties>;
    resetCells(cells: Cell[], options?: CollectionSetOptions): this;
    clear(options?: CellSetOptions): this;
    addNode(metadata: Node | NodeMetadata, options?: AddOptions): Node<import("./node").NodeProperties>;
    updateNode(metadata: NodeMetadata, options?: SetOptions): boolean;
    createNode(metadata: NodeMetadata): Node<import("./node").NodeProperties>;
    addEdge(metadata: EdgeMetadata | Edge, options?: AddOptions): Edge<import("./edge").EdgeProperties>;
    createEdge(metadata: EdgeMetadata): Edge<import("./edge").EdgeProperties>;
    updateEdge(metadata: EdgeMetadata, options?: SetOptions): boolean;
    addCell(cell: Cell | Cell[], options?: AddOptions): this;
    addCells(cells: Cell[], options?: AddOptions): this;
    updateCell(prop: CellProperties, options?: SetOptions): boolean;
    removeCell(cellId: string, options?: CollectionRemoveOptions): Cell | null;
    removeCell(cell: Cell, options?: CollectionRemoveOptions): Cell | null;
    updateCellId(cell: Cell, newId: string): Cell<CellProperties>;
    removeCells(cells: (Cell | string)[], options?: CellRemoveOptions): Cell<CellProperties>[];
    removeConnectedEdges(cell: Cell | string, options?: CellRemoveOptions): Edge<import("./edge").EdgeProperties>[];
    disconnectConnectedEdges(cell: Cell | string, options?: EdgeSetOptions): void;
    has(id: string): boolean;
    has(cell: Cell): boolean;
    total(): number;
    indexOf(cell: Cell): number;
    /**
     * Returns a cell from the graph by its id.
     */
    getCell<T extends Cell = Cell>(id: string): T;
    /**
     * Returns all the nodes and edges in the graph.
     */
    getCells(): Cell<CellProperties>[];
    /**
     * Returns the first cell (node or edge) in the graph. The first cell is
     * defined as the cell with the lowest `zIndex`.
     */
    getFirstCell(): Cell<CellProperties>;
    /**
     * Returns the last cell (node or edge) in the graph. The last cell is
     * defined as the cell with the highest `zIndex`.
     */
    getLastCell(): Cell<CellProperties>;
    /**
     * Returns the lowest `zIndex` value in the graph.
     */
    getMinZIndex(): number;
    /**
     * Returns the highest `zIndex` value in the graph.
     */
    getMaxZIndex(): number;
    protected getCellsFromCache<T extends Cell = Cell>(cache: {
        [key: string]: boolean;
    }): T[];
    /**
     * Returns all the nodes in the graph.
     */
    getNodes(): Node<import("./node").NodeProperties>[];
    /**
     * Returns all the edges in the graph.
     */
    getEdges(): Edge<import("./edge").EdgeProperties>[];
    /**
     * Returns all outgoing edges for the node.
     */
    getOutgoingEdges(cell: Cell | string): Edge<import("./edge").EdgeProperties>[];
    /**
     * Returns all incoming edges for the node.
     */
    getIncomingEdges(cell: Cell | string): Edge<import("./edge").EdgeProperties>[];
    /**
     * Returns edges connected with cell.
     */
    getConnectedEdges(cell: Cell | string, options?: GetConnectedEdgesOptions): Edge<import("./edge").EdgeProperties>[];
    protected isBoundary(cell: Cell | string, isOrigin: boolean): boolean;
    protected getBoundaryNodes(isOrigin: boolean): Node<import("./node").NodeProperties>[];
    /**
     * Returns an array of all the roots of the graph.
     */
    getRoots(): Node<import("./node").NodeProperties>[];
    /**
     * Returns an array of all the leafs of the graph.
     */
    getLeafs(): Node<import("./node").NodeProperties>[];
    /**
     * Returns `true` if the node is a root node, i.e. there is no edges
     * coming to the node.
     */
    isRoot(cell: Cell | string): boolean;
    /**
     * Returns `true` if the node is a leaf node, i.e. there is no edges
     * going out from the node.
     */
    isLeaf(cell: Cell | string): boolean;
    /**
     * Returns all the neighbors of node in the graph. Neighbors are all
     * the nodes connected to node via either incoming or outgoing edge.
     */
    getNeighbors(cell: Cell, options?: GetNeighborsOptions): Cell<CellProperties>[];
    /**
     * Returns `true` if `cell2` is a neighbor of `cell1`.
     */
    isNeighbor(cell1: Cell, cell2: Cell, options?: GetNeighborsOptions): boolean;
    getSuccessors(cell: Cell, options?: GetPredecessorsOptions): Cell<CellProperties>[];
    /**
     * Returns `true` if `cell2` is a successor of `cell1`.
     */
    isSuccessor(cell1: Cell, cell2: Cell, options?: GetPredecessorsOptions): boolean;
    getPredecessors(cell: Cell, options?: GetPredecessorsOptions): Cell<CellProperties>[];
    /**
     * Returns `true` if `cell2` is a predecessor of `cell1`.
     */
    isPredecessor(cell1: Cell, cell2: Cell, options?: GetPredecessorsOptions): boolean;
    protected matchDistance(distance: number, preset?: number | number[] | ((d: number) => boolean)): boolean;
    /**
     * Returns the common ancestor of the passed cells.
     */
    getCommonAncestor(...cells: (Cell | Cell[] | null | undefined)[]): Cell<CellProperties>;
    /**
     * Returns an array of cells that result from finding nodes/edges that
     * are connected to any of the cells in the cells array. This function
     * loops over cells and if the current cell is a edge, it collects its
     * source/target nodes; if it is an node, it collects its incoming and
     * outgoing edges if both the edge terminal (source/target) are in the
     * cells array.
     */
    getSubGraph(cells: Cell[], options?: GetSubgraphOptions): Cell<CellProperties>[];
    /**
     * Clones the whole subgraph (including all the connected links whose
     * source/target is in the subgraph). If `options.deep` is `true`, also
     * take into account all the embedded cells of all the subgraph cells.
     *
     * Returns a map of the form: { [original cell ID]: [clone] }.
     */
    cloneSubGraph(cells: Cell[], options?: GetSubgraphOptions): KeyValue<Cell<CellProperties>>;
    cloneCells(cells: Cell[]): KeyValue<Cell<CellProperties>>;
    /**
     * Returns an array of nodes whose bounding box contains point.
     * Note that there can be more then one node as nodes might overlap.
     */
    getNodesFromPoint(x: number, y: number): Node[];
    getNodesFromPoint(p: PointLike): Node[];
    /**
     * Returns an array of nodes whose bounding box top/left coordinate
     * falls into the rectangle.
     */
    getNodesInArea(x: number, y: number, w: number, h: number, options?: GetCellsInAreaOptions): Node[];
    getNodesInArea(rect: RectangleLike, options?: GetCellsInAreaOptions): Node[];
    /**
     * Returns an array of edges whose bounding box top/left coordinate
     * falls into the rectangle.
     */
    getEdgesInArea(x: number, y: number, w: number, h: number, options?: GetCellsInAreaOptions): Edge[];
    getEdgesInArea(rect: RectangleLike, options?: GetCellsInAreaOptions): Edge[];
    getNodesUnderNode(node: Node, options?: {
        by?: 'bbox' | KeyPoint;
    }): Node<import("./node").NodeProperties>[];
    /**
     * Returns the bounding box that surrounds all cells in the graph.
     */
    getAllCellsBBox(): Rectangle;
    /**
     * Returns the bounding box that surrounds all the given cells.
     */
    getCellsBBox(cells: Cell[], options?: CellGetCellsBBoxOptions): Rectangle;
    search(cell: Cell, iterator: SearchIterator, options?: SearchOptions): void;
    breadthFirstSearch(cell: Cell, iterator: SearchIterator, options?: GetNeighborsOptions): void;
    depthFirstSearch(cell: Cell, iterator: SearchIterator, options?: GetNeighborsOptions): void;
    /** *
     * Returns an array of IDs of nodes on the shortest
     * path between source and target.
     */
    getShortestPath(source: Cell | string, target: Cell | string, options?: GetShortestPathOptions): any[];
    /**
     * Translate all cells in the graph by `tx` and `ty` pixels.
     */
    translate(tx: number, ty: number, options: CellTranslateOptions): this;
    resize(width: number, height: number, options: CellSetOptions): this;
    resizeCells(width: number, height: number, cells: Cell[], options?: CellSetOptions): this;
    toJSON(options?: ToJSONOptions): {
        cells: CellProperties[];
    };
    parseJSON(data: FromJSONData): (Node<import("./node").NodeProperties> | Edge<import("./edge").EdgeProperties>)[];
    fromJSON(data: FromJSONData, options?: FromJSONOptions): this;
    startBatch(name: BatchName, data?: KeyValue): this;
    stopBatch(name: BatchName, data?: KeyValue): this;
    batchUpdate<T>(name: BatchName, execute: () => T, data?: KeyValue): T;
    hasActiveBatch(name?: BatchName | BatchName[]): boolean;
    dispose(): void;
}
export interface SetOptions extends CollectionSetOptions {
}
export interface AddOptions extends CollectionAddOptions {
}
export interface RemoveOptions extends CollectionRemoveOptions {
}
export interface FromJSONOptions extends CollectionSetOptions {
    diff?: boolean;
}
export type FromJSONData = (NodeMetadata | EdgeMetadata)[] | (Partial<ReturnType<typeof Model.toJSON>> & {
    nodes?: NodeMetadata[];
    edges?: EdgeMetadata[];
});
export type ToJSONData = {
    cells: CellProperties[];
};
export interface GetCellsInAreaOptions {
    strict?: boolean;
}
export interface SearchOptions extends GetNeighborsOptions {
    breadthFirst?: boolean;
}
export type SearchIterator = (this: Model, cell: Cell, distance: number) => boolean | void;
export interface GetNeighborsOptions {
    deep?: boolean;
    incoming?: boolean;
    outgoing?: boolean;
    indirect?: boolean;
}
export interface GetConnectedEdgesOptions extends GetNeighborsOptions {
    enclosed?: boolean;
}
export interface GetSubgraphOptions {
    deep?: boolean;
}
export interface GetShortestPathOptions {
    directed?: boolean;
    weight?: DijkstraWeight;
}
export interface GetPredecessorsOptions extends CellGetDescendantsOptions {
    distance?: number | number[] | ((distance: number) => boolean);
}
export interface ModelEventArgs extends CellEventArgs, NodeEventArgs, EdgeEventArgs {
    'batch:start': {
        name: BatchName | string;
        data: KeyValue;
    };
    'batch:stop': {
        name: BatchName | string;
        data: KeyValue;
    };
    sorted: null;
    reseted: {
        current: Cell[];
        previous: Cell[];
        options: CollectionSetOptions;
    };
    updated: {
        added: Cell[];
        merged: Cell[];
        removed: Cell[];
        options: CollectionSetOptions;
    };
}
export type BatchName = 'update' | 'add' | 'remove' | 'clear' | 'to-back' | 'to-front' | 'scale' | 'resize' | 'rotate' | 'translate' | 'mouse' | 'layout' | 'add-edge' | 'fit-embeds' | 'dnd' | 'halo' | 'cut' | 'paste' | 'knob' | 'add-vertex' | 'move-anchor' | 'move-vertex' | 'move-segment' | 'move-arrowhead' | 'move-selection';
export interface ToJSONOptions extends CellToJSONOptions {
}
