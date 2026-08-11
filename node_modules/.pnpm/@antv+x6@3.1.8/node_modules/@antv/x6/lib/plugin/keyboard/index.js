"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyboard = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const keyboard_1 = require("./keyboard");
require("./api");
class Keyboard extends common_1.Disposable {
    constructor(options = {}) {
        super();
        this.name = 'keyboard';
        this.options = Object.assign({ enabled: true }, options);
    }
    init(graph) {
        this.keyboardImpl = new keyboard_1.KeyboardImpl(Object.assign(Object.assign({}, this.options), { graph }));
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
exports.Keyboard = Keyboard;
tslib_1.__decorate([
    (0, common_1.disposable)()
], Keyboard.prototype, "dispose", null);
//# sourceMappingURL=index.js.map