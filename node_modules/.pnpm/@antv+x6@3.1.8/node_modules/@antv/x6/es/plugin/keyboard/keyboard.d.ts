import Mousetrap from 'mousetrap';
import { Disposable, type IDisablable } from '../../common';
import type { Graph } from '../../graph';
import type { KeyboardImplAction, KeyboardImplHandler, KeyboardImplOptions } from './type';
/**
 * Create a Mousetrap instance for the keyboard.
 */
export declare function createMousetrap(keyboard: KeyboardImpl): Mousetrap.MousetrapInstance;
export declare class KeyboardImpl extends Disposable implements IDisablable {
    private readonly options;
    readonly target: HTMLElement | Document;
    private readonly container;
    private readonly mousetrap;
    private get graph();
    constructor(options: KeyboardImplOptions & {
        graph: Graph;
    });
    get disabled(): boolean;
    enable(): void;
    disable(): void;
    on(keys: string | string[], callback: KeyboardImplHandler, action?: KeyboardImplAction): void;
    off(keys: string | string[], action?: KeyboardImplAction): void;
    clear(): void;
    trigger(key: string, action?: KeyboardImplAction): void;
    private focus;
    private getKeys;
    isEnabledForEvent(e: KeyboardEvent): boolean;
    dispose(): void;
}
