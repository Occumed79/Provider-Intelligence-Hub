"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardImpl = void 0;
exports.createMousetrap = createMousetrap;
const tslib_1 = require("tslib");
const mousetrap_1 = tslib_1.__importDefault(require("mousetrap"));
const common_1 = require("../../common");
const util_1 = require("./util");
/**
 * Create a Mousetrap instance for the keyboard.
 */
function createMousetrap(keyboard) {
    const mousetrap = new mousetrap_1.default(keyboard.target);
    const stopCallback = mousetrap.stopCallback;
    mousetrap.stopCallback = (e, elem, combo) => {
        if (keyboard.isEnabledForEvent(e)) {
            if (stopCallback) {
                return stopCallback.call(mousetrap, e, elem, combo);
            }
            return false;
        }
        return true;
    };
    return mousetrap;
}
class KeyboardImpl extends common_1.Disposable {
    get graph() {
        return this.options.graph;
    }
    constructor(options) {
        super();
        this.options = options;
        const scroller = this.graph.getPlugin('scroller');
        this.container = scroller ? scroller.container : this.graph.container;
        if (options.global) {
            this.target = document;
        }
        else {
            this.target = this.container;
            if (!this.disabled) {
                // ensure the container focusable
                this.target.setAttribute('tabindex', '-1');
            }
            // change to mouseup event，prevent page stalling caused by focus
            this.graph.on('cell:mouseup', this.focus.bind(this), this);
            this.graph.on('blank:mouseup', this.focus.bind(this), this);
        }
        this.mousetrap = createMousetrap(this);
    }
    get disabled() {
        return this.options.enabled !== true;
    }
    enable() {
        if (this.disabled) {
            this.options.enabled = true;
            if (this.target instanceof HTMLElement) {
                this.target.setAttribute('tabindex', '-1');
            }
        }
    }
    disable() {
        if (!this.disabled) {
            this.options.enabled = false;
            if (this.target instanceof HTMLElement) {
                this.target.removeAttribute('tabindex');
            }
        }
    }
    on(keys, callback, action) {
        this.mousetrap.bind(this.getKeys(keys), callback, action);
    }
    off(keys, action) {
        this.mousetrap.unbind(this.getKeys(keys), action);
    }
    clear() {
        this.mousetrap.reset();
    }
    trigger(key, action) {
        this.mousetrap.trigger((0, util_1.formatKey)(key, this.options.format, this.graph), action);
    }
    focus(e) {
        const isInput = (0, util_1.isInputEvent)(e.e);
        if (isInput) {
            return;
        }
        const target = this.target;
        target.focus({
            preventScroll: true,
        });
    }
    getKeys(keys) {
        return (Array.isArray(keys) ? keys : [keys]).map((key) => (0, util_1.formatKey)(key, this.options.format, this.graph));
    }
    isEnabledForEvent(e) {
        const allowed = !this.disabled && (0, util_1.isGraphEvent)(e, this.target, this.container);
        const isInput = (0, util_1.isInputEvent)(e);
        if (allowed) {
            if (isInput && (e.key === 'Backspace' || e.key === 'Delete')) {
                return false;
            }
            if (this.options.guard) {
                return common_1.FunctionExt.call(this.options.guard, this.graph, e);
            }
        }
        return allowed;
    }
    dispose() {
        this.mousetrap.reset();
    }
}
exports.KeyboardImpl = KeyboardImpl;
tslib_1.__decorate([
    (0, common_1.disposable)()
], KeyboardImpl.prototype, "dispose", null);
//# sourceMappingURL=keyboard.js.map