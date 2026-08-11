import { MousetrapInstance } from 'mousetrap';
import LogicFlow from '../LogicFlow';
export * from './shortcut';
export type Action = 'keypress' | 'keydown' | 'keyup';
export type Handler = (e: KeyboardEvent) => void;
export interface KeyboardDef {
    enabled: boolean;
    shortcuts?: Array<{
        keys: string | string[];
        callback: Handler;
        action?: Action;
    }>;
}
export interface KeyboardOptions {
    lf: LogicFlow;
    keyboard?: KeyboardDef;
}
export declare class Keyboard {
    readonly mousetrap: MousetrapInstance;
    options: KeyboardOptions;
    private readonly target;
    constructor(options: KeyboardOptions);
    initShortcuts(): void;
    on(keys: string | string[], callback: Handler, action?: Action): void;
    get disabled(): boolean;
    off(keys: string | string[], action?: Action): void;
    enable(force: boolean): void;
    disable(): void;
    destroy(): void;
    private getKeys;
    protected formatKey(key: string): string;
}
export default Keyboard;
