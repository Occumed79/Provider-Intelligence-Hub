import { Basecoat } from '../../common';
import type { Graph, GraphPlugin } from '../../graph';
import type { Cell } from '../../model';
import type { ClipboardEventArgs, ClipboardImplCopyOptions, ClipboardImplPasteOptions, ClipboardOptions } from './type';
import './api';
export declare class Clipboard extends Basecoat<ClipboardEventArgs> implements GraphPlugin {
    name: string;
    private clipboardImpl;
    private graph;
    options: ClipboardOptions;
    get disabled(): boolean;
    get cells(): Cell<import("../../model").CellProperties>[];
    constructor(options?: ClipboardOptions);
    init(graph: Graph): void;
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    toggleEnabled(enabled?: boolean): this;
    isEmpty(options?: ClipboardOptions): boolean;
    getCellsInClipboard(): Cell<import("../../model").CellProperties>[];
    clean(force?: boolean): this;
    copy(cells: Cell[], options?: ClipboardImplCopyOptions): this;
    cut(cells: Cell[], options?: ClipboardImplCopyOptions): this;
    paste(options?: ClipboardImplPasteOptions, graph?: Graph): Cell<import("../../model").CellProperties>[];
    protected get commonOptions(): {
        useLocalStorage?: boolean;
    };
    protected notify<K extends keyof ClipboardEventArgs>(name: K, args: ClipboardEventArgs[K]): void;
    dispose(): void;
}
