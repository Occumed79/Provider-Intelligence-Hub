import { Basecoat, type KeyValue } from '../../common';
import type { Graph, GraphPlugin } from '../../graph';
import { Model, type ModelEventArgs } from '../../model';
import type { HistoryCommand, HistoryCommands, HistoryCommonOptions, HistoryEventArgs, HistoryModelEvents, HistoryOptions } from './type';
import { Validator, type ValidatorCallback } from './validator';
import './api';
export declare class History extends Basecoat<HistoryEventArgs> implements GraphPlugin {
    name: string;
    graph: Graph;
    model: Model;
    readonly options: HistoryCommonOptions;
    readonly validator: Validator;
    protected redoStack: HistoryCommands[];
    protected undoStack: HistoryCommands[];
    protected batchCommands: HistoryCommand[] | null;
    protected batchLevel: number;
    protected lastBatchIndex: number;
    protected freezed: boolean;
    protected stackSize: number;
    protected readonly handlers: (<T extends HistoryModelEvents>(event: T, args: ModelEventArgs[T]) => any)[];
    constructor(options?: HistoryOptions);
    init(graph: Graph): void;
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    toggleEnabled(enabled?: boolean): this;
    undo(options?: KeyValue): this;
    redo(options?: KeyValue): this;
    /**
     * Same as `undo()` but does not store the undo-ed command to the
     * `redoStack`. Canceled command therefore cannot be redo-ed.
     */
    cancel(options?: KeyValue): this;
    getSize(): number;
    getUndoRemainSize(): number;
    getUndoSize(): number;
    getRedoSize(): number;
    canUndo(): boolean;
    canRedo(): boolean;
    clean(options?: KeyValue): this;
    get disabled(): boolean;
    protected validate(events: string | string[], ...callbacks: ValidatorCallback[]): this;
    protected startListening(): void;
    protected stopListening(): void;
    protected createCommand(options?: {
        batch: boolean;
    }): HistoryCommand;
    protected revertCommand(cmd: HistoryCommands, options?: KeyValue): void;
    protected applyCommand(cmd: HistoryCommands, options?: KeyValue): void;
    protected executeCommand(cmd: HistoryCommand, revert: boolean, options: KeyValue): void;
    protected addCommand<T extends keyof ModelEventArgs>(event: T, args: ModelEventArgs[T]): void;
    /**
     * Gather multiple changes into a single command. These commands could
     * be reverted with single `undo()` call. From the moment the function
     * is called every change made on model is not stored into the undoStack.
     * Changes are temporarily kept until `storeBatchCommand()` is called.
     */
    protected initBatchCommand(options: KeyValue): void;
    /**
     * Store changes temporarily kept in the undoStack. You have to call this
     * function as many times as `initBatchCommand()` been called.
     */
    protected storeBatchCommand(options: KeyValue): void;
    protected filterBatchCommand(batchCommands: HistoryCommand[]): any[];
    protected notify(event: keyof HistoryEventArgs, cmd: HistoryCommands | null, options: KeyValue): void;
    protected push(cmd: HistoryCommand, options: KeyValue): void;
    /**
     * Conditionally combine multiple undo items into one.
     *
     * Currently this is only used combine a `cell:changed:position` event
     * followed by multiple `cell:change:parent` and `cell:change:children`
     * events, such that a "move + embed" action can be undone in one step.
     *
     * See https://github.com/antvis/X6/issues/2421
     *
     * This is an ugly WORKAROUND. It does not solve deficiencies in the batch
     * system itself.
     */
    protected consolidateCommands(): void;
    protected undoStackPush(cmd: HistoryCommands): void;
    protected ensureUndefinedAttrs(newAttrs: Record<string, any>, oldAttrs: Record<string, any>): boolean;
    dispose(): void;
}
