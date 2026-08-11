"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Snapline = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const snapline_1 = require("./snapline");
const raw_1 = require("./style/raw");
require("./api");
class Snapline extends common_1.Disposable {
    constructor(options = {}) {
        super();
        this.name = 'snapline';
        this.options = Object.assign({ enabled: true, tolerance: 10 }, options);
        common_1.CssLoader.ensure(this.name, raw_1.content);
    }
    init(graph) {
        this.snaplineImpl = new snapline_1.SnaplineImpl(Object.assign(Object.assign({}, this.options), { graph }));
    }
    // #region api
    isEnabled() {
        return !this.snaplineImpl.disabled;
    }
    enable() {
        this.snaplineImpl.enable();
    }
    disable() {
        this.snaplineImpl.disable();
    }
    toggleEnabled(enabled) {
        if (enabled != null) {
            if (enabled !== this.isEnabled()) {
                if (enabled) {
                    this.enable();
                }
                else {
                    this.disable();
                }
            }
        }
        else {
            if (this.isEnabled()) {
                this.disable();
            }
            else {
                this.enable();
            }
            return this;
        }
    }
    hide() {
        this.snaplineImpl.hide();
        return this;
    }
    setFilter(filter) {
        this.snaplineImpl.setFilter(filter);
        return this;
    }
    isOnResizingEnabled() {
        return this.snaplineImpl.options.resizing === true;
    }
    enableOnResizing() {
        this.snaplineImpl.options.resizing = true;
        return this;
    }
    disableOnResizing() {
        this.snaplineImpl.options.resizing = false;
        return this;
    }
    toggleOnResizing(enableOnResizing) {
        if (enableOnResizing != null) {
            if (enableOnResizing !== this.isOnResizingEnabled()) {
                if (enableOnResizing) {
                    this.enableOnResizing();
                }
                else {
                    this.disableOnResizing();
                }
            }
        }
        else if (this.isOnResizingEnabled()) {
            this.disableOnResizing();
        }
        else {
            this.enableOnResizing();
        }
        return this;
    }
    isSharp() {
        return this.snaplineImpl.options.sharp === true;
    }
    enableSharp() {
        this.snaplineImpl.options.sharp = true;
        return this;
    }
    disableSharp() {
        this.snaplineImpl.options.sharp = false;
        return this;
    }
    toggleSharp(sharp) {
        if (sharp != null) {
            if (sharp !== this.isSharp()) {
                if (sharp) {
                    this.enableSharp();
                }
                else {
                    this.disableSharp();
                }
            }
        }
        else if (this.isSharp()) {
            this.disableSharp();
        }
        else {
            this.enableSharp();
        }
        return this;
    }
    getTolerance() {
        return this.snaplineImpl.options.tolerance;
    }
    setTolerance(tolerance) {
        this.snaplineImpl.options.tolerance = tolerance;
        return this;
    }
    captureCursorOffset(e) {
        this.snaplineImpl.captureCursorOffset(e);
    }
    snapOnMoving(args) {
        this.snaplineImpl.snapOnMoving(args);
    }
    // #endregion
    dispose() {
        this.snaplineImpl.dispose();
        common_1.CssLoader.clean(this.name);
    }
}
exports.Snapline = Snapline;
tslib_1.__decorate([
    (0, common_1.disposable)()
], Snapline.prototype, "dispose", null);
//# sourceMappingURL=index.js.map