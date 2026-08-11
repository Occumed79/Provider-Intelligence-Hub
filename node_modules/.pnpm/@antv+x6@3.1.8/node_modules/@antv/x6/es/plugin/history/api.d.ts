import type { KeyValue } from '../../common';
import type { HistoryArgs, HistoryCommand } from './type';
declare module '../../graph/graph' {
    interface Graph {
        isHistoryEnabled: () => boolean;
        enableHistory: () => Graph;
        disableHistory: () => Graph;
        toggleHistory: (enabled?: boolean) => Graph;
        undo: (options?: KeyValue) => Graph;
        redo: (options?: KeyValue) => Graph;
        undoAndCancel: (options?: KeyValue) => Graph;
        canUndo: () => boolean;
        canRedo: () => boolean;
        getHistoryStackSize: () => number;
        getUndoStackSize: () => number;
        getRedoStackSize: () => number;
        getUndoRemainSize: () => number;
        cleanHistory: (options?: KeyValue) => Graph;
    }
}
declare module '../../graph/events' {
    interface EventArgs {
        'history:undo': HistoryArgs;
        'history:redo': HistoryArgs;
        'history:cancel': HistoryArgs;
        'history:add': HistoryArgs;
        'history:clean': HistoryArgs<null>;
        'history:change': HistoryArgs<null>;
        'history:batch': {
            cmd: HistoryCommand;
            options: KeyValue;
        };
    }
}
