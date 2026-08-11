import { Disposable } from '../../common';
import type { Graph, GraphPlugin } from '../../graph';
import './api';
import type { KeyboardImplAction, KeyboardImplHandler, KeyboardImplOptions } from './type';
export declare class Keyboard extends Disposable implements GraphPlugin {
    name: string;
    private keyboardImpl;
    options: KeyboardImplOptions;
    constructor(options?: KeyboardImplOptions);
    init(graph: Graph): void;
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    toggleEnabled(enabled?: boolean): this;
    bindKey(keys: string | string[], callback: KeyboardImplHandler, action?: KeyboardImplAction): this;
    trigger(key: string, action?: KeyboardImplAction): this;
    clear(): this;
    unbindKey(keys: string | string[], action?: KeyboardImplAction): this;
    dispose(): void;
}
