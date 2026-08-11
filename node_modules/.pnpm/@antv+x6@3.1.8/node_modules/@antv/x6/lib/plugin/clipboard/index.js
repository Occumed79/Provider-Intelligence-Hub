"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clipboard = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const clipboard_1 = require("./clipboard");
require("./api");
class Clipboard extends common_1.Basecoat {
    get disabled() {
        return this.options.enabled !== true;
    }
    get cells() {
        return this.clipboardImpl.cells;
    }
    constructor(options = {}) {
        super();
        this.name = 'clipboard';
        this.options = Object.assign({ enabled: true }, options);
    }
    init(graph) {
        this.graph = graph;
        this.clipboardImpl = new clipboard_1.ClipboardImpl();
        this.clipboardImpl.deserialize(this.options);
    }
    // #region api
    isEnabled() {
        return !this.disabled;
    }
    enable() {
        if (this.disabled) {
            this.options.enabled = true;
        }
    }
    disable() {
        if (!this.disabled) {
            this.options.enabled = false;
        }
    }
    toggleEnabled(enabled) {
        // the enabled state is not specified.
        if (enabled === undefined) {
            enabled = !this.isEnabled();
        }
        enabled ? this.enable() : this.disable();
        return this;
    }
    isEmpty(options = {}) {
        return this.clipboardImpl.isEmpty(options);
    }
    getCellsInClipboard() {
        return this.cells;
    }
    clean(force) {
        if (!this.disabled || force) {
            this.clipboardImpl.clean();
            this.notify('clipboard:changed', { cells: [] });
        }
        return this;
    }
    copy(cells, options = {}) {
        if (!this.disabled) {
            this.clipboardImpl.copy(cells, this.graph, Object.assign(Object.assign({}, this.commonOptions), options));
            this.notify('clipboard:changed', { cells });
        }
        return this;
    }
    cut(cells, options = {}) {
        if (!this.disabled) {
            this.clipboardImpl.cut(cells, this.graph, Object.assign(Object.assign({}, this.commonOptions), options));
            this.notify('clipboard:changed', { cells });
        }
        return this;
    }
    paste(options = {}, graph = this.graph) {
        if (!this.disabled) {
            return this.clipboardImpl.paste(graph, Object.assign(Object.assign({}, this.commonOptions), options));
        }
        return [];
    }
    // #endregion
    get commonOptions() {
        const _a = this.options, { enabled } = _a, others = tslib_1.__rest(_a, ["enabled"]);
        return others;
    }
    notify(name, args) {
        this.trigger(name, args);
        this.graph.trigger(name, args);
    }
    dispose() {
        this.clean(true);
        this.off();
    }
}
exports.Clipboard = Clipboard;
tslib_1.__decorate([
    (0, common_1.disposable)()
], Clipboard.prototype, "dispose", null);
//# sourceMappingURL=index.js.map