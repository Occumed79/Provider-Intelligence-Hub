import { __decorate } from "tslib";
import { Disposable, disposable } from '../../common';
import { KeyboardImpl } from './keyboard';
import './api';
export class Keyboard extends Disposable {
    constructor(options = {}) {
        super();
        this.name = 'keyboard';
        this.options = Object.assign({ enabled: true }, options);
    }
    init(graph) {
        this.keyboardImpl = new KeyboardImpl(Object.assign(Object.assign({}, this.options), { graph }));
    }
    // #region api
    isEnabled() {
        return !this.keyboardImpl.disabled;
    }
    enable() {
        this.keyboardImpl.enable();
    }
    disable() {
        this.keyboardImpl.disable();
    }
    toggleEnabled(enabled) {
        // the enabled state is not specified.
        if (enabled === undefined) {
            enabled = !this.isEnabled();
        }
        enabled ? this.enable() : this.disable();
        return this;
    }
    bindKey(keys, callback, action) {
        this.keyboardImpl.on(keys, callback, action);
        return this;
    }
    trigger(key, action) {
        this.keyboardImpl.trigger(key, action);
        return this;
    }
    clear() {
        this.keyboardImpl.clear();
        return this;
    }
    unbindKey(keys, action) {
        this.keyboardImpl.off(keys, action);
        return this;
    }
    // #endregion
    dispose() {
        this.keyboardImpl.dispose();
    }
}
__decorate([
    disposable()
], Keyboard.prototype, "dispose", null);
//# sourceMappingURL=index.js.map