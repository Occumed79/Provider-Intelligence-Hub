import type { Cell } from '../../model';
import type { ClipboardImplCopyOptions, ClipboardImplPasteOptions, ClipboardOptions } from './type';
declare module '../../graph/graph' {
    interface Graph {
        isClipboardEnabled: () => boolean;
        enableClipboard: () => Graph;
        disableClipboard: () => Graph;
        toggleClipboard: (enabled?: boolean) => Graph;
        isClipboardEmpty: (options?: ClipboardOptions) => boolean;
        getCellsInClipboard: () => Cell[];
        cleanClipboard: () => Graph;
        copy: (cells: Cell[], options?: ClipboardImplCopyOptions) => Graph;
        cut: (cells: Cell[], options?: ClipboardImplCopyOptions) => Graph;
        paste: (options?: ClipboardImplPasteOptions, graph?: Graph) => Cell[];
    }
}
declare module '../../graph/events' {
    interface EventArgs {
        'clipboard:changed': {
            cells: Cell[];
        };
    }
}
