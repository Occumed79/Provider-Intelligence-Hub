import { MousetrapInstance } from 'mousetrap';
import LogicFlow from '..';
export declare class Keyboard {
    private target;
    readonly mousetrap: MousetrapInstance;
    options: Required<Keyboard.Options>;
    constructor(options: Keyboard.Options);
    protected formatKey(key: string): string;
    private getKeys;
    get disabled(): boolean;
    on(keys: string | string[], callback: Keyboard.HandlerFunc, action?: Keyboard.ActionType): void;
    off(keys: string | string[], action?: Keyboard.ActionType): void;
    enable(force: boolean): void;
    disable(): void;
    initShortcuts(): void;
}
export declare namespace Keyboard {
    type ActionType = 'keypress' | 'keydown' | 'keyup';
    type HandlerFunc = (e: KeyboardEvent) => void;
    interface Shortcut {
        keys: string | string[];
        callback: HandlerFunc;
        action?: ActionType;
    }
    interface KeyboardDef {
        enabled: boolean;
        shortcuts?: Shortcut | Shortcut[];
    }
    interface Options {
        lf: LogicFlow;
        keyboard?: KeyboardDef;
    }
}
export default Keyboard;
