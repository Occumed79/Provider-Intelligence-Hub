import { Basecoat } from '../common';
import type { Cell, CellBaseEventArgs, CellSetOptions } from './cell';
import type { Edge } from './edge';
import type { Node } from './node';
export declare class Collection extends Basecoat<CollectionEventArgs> {
    length: number;
    comparator: Comparator | null;
    private cells;
    private map;
    constructor(cells: Cell | Cell[], options?: Options);
    toJSON(): import("./cell").CellProperties[];
    add(cells: Cell | Cell[], options?: CollectionAddOptions): this;
    add(cells: Cell | Cell[], index: number, options?: CollectionAddOptions): this;
    remove(cell: Cell, options?: CollectionRemoveOptions): Cell;
    remove(cells: Cell[], options?: CollectionRemoveOptions): Cell[];
    protected removeCells(cells: Cell[], options: CollectionRemoveOptions): any[];
    reset(cells: Cell | Cell[], options?: CollectionSetOptions): this;
    push(cell: Cell, options?: CollectionSetOptions): this;
    pop(options?: CollectionSetOptions): Cell<import("./cell").CellProperties>;
    unshift(cell: Cell, options?: CollectionSetOptions): this;
    shift(options?: CollectionSetOptions): Cell<import("./cell").CellProperties>;
    get(cell?: string | number | Cell | null): Cell | null;
    has(cell: string | Cell): boolean;
    at(index: number): Cell | null;
    first(): Cell<import("./cell").CellProperties>;
    last(): Cell<import("./cell").CellProperties>;
    indexOf(cell: Cell): number;
    toArray(): Cell<import("./cell").CellProperties>[];
    sort(options?: CollectionSetOptions): this;
    clone(): Collection;
    protected reference(cell: Cell): void;
    protected unreference(cell: Cell): void;
    protected notifyCellEvent<K extends keyof CellBaseEventArgs>(name: K, args: CellBaseEventArgs[K]): void;
    protected clean(): void;
    dispose(): void;
}
export type Comparator = string | string[] | ((cell: Cell) => number);
interface Options {
    comparator?: Comparator;
}
export interface CollectionSetOptions extends CellSetOptions {
}
export interface CollectionRemoveOptions extends CellSetOptions {
    /**
     * The default is to remove all the associated links.
     * Set `disconnectEdges` option to `true` to disconnect edges
     * when a cell is removed.
     */
    disconnectEdges?: boolean;
    dryrun?: boolean;
}
export interface CollectionAddOptions extends CollectionSetOptions {
    sort?: boolean;
    merge?: boolean;
    dryrun?: boolean;
}
export interface CollectionEventArgs extends CellBaseEventArgs, NodeEventArgs, EdgeEventArgs {
    sorted?: null;
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
    added: {
        cell: Cell;
        index: number;
        options: CollectionAddOptions;
    };
    removed: {
        cell: Cell;
        index: number;
        options: CollectionRemoveOptions;
    };
}
interface NodeEventCommonArgs {
    node: Node;
}
interface EdgeEventCommonArgs {
    edge: Edge;
}
export interface CellEventArgs {
    'cell:animation:finish': CellBaseEventArgs['animation:finish'];
    'cell:animation:cancel': CellBaseEventArgs['animation:cancel'];
    'cell:changed': CellBaseEventArgs['changed'];
    'cell:added': CellBaseEventArgs['added'];
    'cell:removed': CellBaseEventArgs['removed'];
    'cell:change:*': CellBaseEventArgs['change:*'];
    'cell:change:attrs': CellBaseEventArgs['change:attrs'];
    'cell:change:zIndex': CellBaseEventArgs['change:zIndex'];
    'cell:change:markup': CellBaseEventArgs['change:markup'];
    'cell:change:visible': CellBaseEventArgs['change:visible'];
    'cell:change:parent': CellBaseEventArgs['change:parent'];
    'cell:change:children': CellBaseEventArgs['change:children'];
    'cell:change:tools': CellBaseEventArgs['change:tools'];
    'cell:change:view': CellBaseEventArgs['change:view'];
    'cell:change:data': CellBaseEventArgs['change:data'];
    'cell:change:size': CellBaseEventArgs['change:size'];
    'cell:change:angle': CellBaseEventArgs['change:angle'];
    'cell:change:position': CellBaseEventArgs['change:position'];
    'cell:change:ports': CellBaseEventArgs['change:ports'];
    'cell:change:portMarkup': CellBaseEventArgs['change:portMarkup'];
    'cell:change:portLabelMarkup': CellBaseEventArgs['change:portLabelMarkup'];
    'cell:change:portContainerMarkup': CellBaseEventArgs['change:portContainerMarkup'];
    'cell:ports:added': CellBaseEventArgs['ports:added'];
    'cell:ports:removed': CellBaseEventArgs['ports:removed'];
    'cell:change:source': CellBaseEventArgs['change:source'];
    'cell:change:target': CellBaseEventArgs['change:target'];
    'cell:change:router': CellBaseEventArgs['change:router'];
    'cell:change:connector': CellBaseEventArgs['change:connector'];
    'cell:change:vertices': CellBaseEventArgs['change:vertices'];
    'cell:change:labels': CellBaseEventArgs['change:labels'];
    'cell:change:defaultLabel': CellBaseEventArgs['change:defaultLabel'];
    'cell:vertexs:added': CellBaseEventArgs['vertexs:added'];
    'cell:vertexs:removed': CellBaseEventArgs['vertexs:removed'];
    'cell:labels:added': CellBaseEventArgs['labels:added'];
    'cell:labels:removed': CellBaseEventArgs['labels:removed'];
    'cell:batch:start': CellBaseEventArgs['batch:start'];
    'cell:batch:stop': CellBaseEventArgs['batch:stop'];
}
export interface NodeEventArgs {
    'node:animation:finish': CellBaseEventArgs['animation:finish'];
    'node:animation:cancel': CellBaseEventArgs['animation:cancel'];
    'node:changed': NodeEventCommonArgs & CellEventArgs['cell:changed'];
    'node:added': NodeEventCommonArgs & CellEventArgs['cell:added'];
    'node:removed': NodeEventCommonArgs & CellEventArgs['cell:removed'];
    'node:change:*': NodeEventCommonArgs & CellBaseEventArgs['change:*'];
    'node:change:attrs': NodeEventCommonArgs & CellBaseEventArgs['change:attrs'];
    'node:change:zIndex': NodeEventCommonArgs & CellBaseEventArgs['change:zIndex'];
    'node:change:markup': NodeEventCommonArgs & CellBaseEventArgs['change:markup'];
    'node:change:visible': NodeEventCommonArgs & CellBaseEventArgs['change:visible'];
    'node:change:parent': NodeEventCommonArgs & CellBaseEventArgs['change:parent'];
    'node:change:children': NodeEventCommonArgs & CellBaseEventArgs['change:children'];
    'node:change:tools': NodeEventCommonArgs & CellBaseEventArgs['change:tools'];
    'node:change:view': NodeEventCommonArgs & CellBaseEventArgs['change:view'];
    'node:change:data': NodeEventCommonArgs & CellBaseEventArgs['change:data'];
    'node:change:size': NodeEventCommonArgs & CellBaseEventArgs['change:size'];
    'node:change:position': NodeEventCommonArgs & CellBaseEventArgs['change:position'];
    'node:change:angle': NodeEventCommonArgs & CellBaseEventArgs['change:angle'];
    'node:change:ports': NodeEventCommonArgs & CellBaseEventArgs['change:ports'];
    'node:change:portMarkup': NodeEventCommonArgs & CellBaseEventArgs['change:portMarkup'];
    'node:change:portLabelMarkup': NodeEventCommonArgs & CellBaseEventArgs['change:portLabelMarkup'];
    'node:change:portContainerMarkup': NodeEventCommonArgs & CellBaseEventArgs['change:portContainerMarkup'];
    'node:ports:added': NodeEventCommonArgs & CellBaseEventArgs['ports:added'];
    'node:ports:removed': NodeEventCommonArgs & CellBaseEventArgs['ports:removed'];
    'node:batch:start': NodeEventCommonArgs & CellBaseEventArgs['batch:start'];
    'node:batch:stop': NodeEventCommonArgs & CellBaseEventArgs['batch:stop'];
}
export interface EdgeEventArgs {
    'edge:animation:finish': CellBaseEventArgs['animation:finish'];
    'edge:animation:cancel': CellBaseEventArgs['animation:cancel'];
    'edge:changed': EdgeEventCommonArgs & CellEventArgs['cell:changed'];
    'edge:added': EdgeEventCommonArgs & CellEventArgs['cell:added'];
    'edge:removed': EdgeEventCommonArgs & CellEventArgs['cell:removed'];
    'edge:change:*': EdgeEventCommonArgs & CellBaseEventArgs['change:*'];
    'edge:change:attrs': EdgeEventCommonArgs & CellBaseEventArgs['change:attrs'];
    'edge:change:zIndex': EdgeEventCommonArgs & CellBaseEventArgs['change:zIndex'];
    'edge:change:markup': EdgeEventCommonArgs & CellBaseEventArgs['change:markup'];
    'edge:change:visible': EdgeEventCommonArgs & CellBaseEventArgs['change:visible'];
    'edge:change:parent': EdgeEventCommonArgs & CellBaseEventArgs['change:parent'];
    'edge:change:children': EdgeEventCommonArgs & CellBaseEventArgs['change:children'];
    'edge:change:tools': EdgeEventCommonArgs & CellBaseEventArgs['change:tools'];
    'edge:change:data': EdgeEventCommonArgs & CellBaseEventArgs['change:data'];
    'edge:change:source': EdgeEventCommonArgs & CellBaseEventArgs['change:source'];
    'edge:change:target': EdgeEventCommonArgs & CellBaseEventArgs['change:target'];
    'edge:change:router': EdgeEventCommonArgs & CellBaseEventArgs['change:router'];
    'edge:change:connector': EdgeEventCommonArgs & CellBaseEventArgs['change:connector'];
    'edge:change:vertices': EdgeEventCommonArgs & CellBaseEventArgs['change:vertices'];
    'edge:change:labels': EdgeEventCommonArgs & CellBaseEventArgs['change:labels'];
    'edge:change:defaultLabel': EdgeEventCommonArgs & CellBaseEventArgs['change:defaultLabel'];
    'edge:vertexs:added': EdgeEventCommonArgs & CellBaseEventArgs['vertexs:added'];
    'edge:vertexs:removed': EdgeEventCommonArgs & CellBaseEventArgs['vertexs:removed'];
    'edge:labels:added': EdgeEventCommonArgs & CellBaseEventArgs['labels:added'];
    'edge:labels:removed': EdgeEventCommonArgs & CellBaseEventArgs['labels:removed'];
    'edge:batch:start': EdgeEventCommonArgs & CellBaseEventArgs['batch:start'];
    'edge:batch:stop': EdgeEventCommonArgs & CellBaseEventArgs['batch:stop'];
}
export {};
