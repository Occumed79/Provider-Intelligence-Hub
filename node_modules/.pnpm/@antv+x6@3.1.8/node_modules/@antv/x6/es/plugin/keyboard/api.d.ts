import type { KeyboardImplAction, KeyboardImplHandler } from './type';
declare module '../../graph/graph' {
    interface Graph {
        isKeyboardEnabled: () => boolean;
        enableKeyboard: () => Graph;
        disableKeyboard: () => Graph;
        toggleKeyboard: (enabled?: boolean) => Graph;
        bindKey: (keys: string | string[], callback: KeyboardImplHandler, action?: KeyboardImplAction) => Graph;
        unbindKey: (keys: string | string[], action?: KeyboardImplAction) => Graph;
        clearKeys: () => Graph;
        triggerKey: (key: string, action: KeyboardImplAction) => Graph;
    }
}
