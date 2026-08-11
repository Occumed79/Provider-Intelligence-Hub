import { Graph } from '../../graph';
import { type Cell, Model } from '../../model';
import type { ClipboardImplCopyOptions, ClipboardImplOptions, ClipboardImplPasteOptions } from './type';
export declare class ClipboardImpl {
    protected options: ClipboardImplOptions;
    cells: Cell[];
    copy(cells: Cell[], graph: Graph | Model, options?: ClipboardImplCopyOptions): void;
    cut(cells: Cell[], graph: Graph | Model, options?: ClipboardImplCopyOptions): void;
    paste(graph: Graph | Model, options?: ClipboardImplPasteOptions): Cell<import("../../model").CellProperties>[];
    serialize(options: ClipboardImplPasteOptions): void;
    deserialize(options: ClipboardImplPasteOptions): void;
    isEmpty(options?: ClipboardImplOptions): boolean;
    clean(): void;
}
