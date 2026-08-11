import { Basecoat } from '../../common';
import type { History } from '.';
import type { HistoryCommand, HistoryEventArgs } from './type';
export interface ValidatorOptions {
    history: History;
    /**
     * To cancel (= undo + delete from redo stack) a command if is not valid.
     */
    cancelInvalid?: boolean;
}
export type ValidatorCallback = (err: Error | null, cmd: HistoryCommand, next: (err: Error | null) => any) => any;
export interface ValidatorEventArgs {
    invalid: {
        err: Error;
    };
}
/**
 * Runs a set of callbacks to determine if a command is valid. This is
 * useful for checking if a certain action in your application does
 * lead to an invalid state of the graph.
 */
export declare class Validator extends Basecoat<ValidatorEventArgs> {
    protected readonly command: History;
    protected readonly cancelInvalid: boolean;
    protected readonly map: {
        [event: string]: ValidatorCallback[][];
    };
    constructor(options: ValidatorOptions);
    protected onCommandAdded({ cmds }: HistoryEventArgs['add']): boolean;
    protected isValidCommand(cmd: HistoryCommand): boolean;
    validate(events: string | string[], ...callbacks: ValidatorCallback[]): this;
    dispose(): void;
}
