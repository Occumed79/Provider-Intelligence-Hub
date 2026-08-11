import { __decorate } from "tslib";
import Mousetrap from 'mousetrap';
import { Disposable, disposable, FunctionExt, } from '../../common';
import { formatKey, isGraphEvent, isInputEvent } from './util';
/**
 * Create a Mousetrap instance for the keyboard.
 */
export function createMousetrap(keyboard) {
    const mousetrap = new Mousetrap(keyboard.target);
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
export class KeyboardImpl extends Disposable {
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
        this.mousetrap.trigger(formatKey(key, this.options.format, this.graph), action);
    }
    focus(e) {
        const isInput = isInputEvent(e.e);
        if (isInput) {
            return;
        }
        const target = this.target;
        target.focus({
            preventScroll: true,
        });
    }
    getKeys(keys) {
        return (Array.isArray(keys) ? keys : [keys]).map((key) => formatKey(key, this.options.format, this.graph));
    }
    isEnabledForEvent(e) {
        const allowed = !this.disabled && isGraphEvent(e, this.target, this.container);
        const isInput = isInputEvent(e);
        if (allowed) {
            if (isInput && (e.key === 'Backspace' || e.key === 'Delete')) {
                return false;
            }
            if (this.options.guard) {
                return FunctionExt.call(this.options.guard, this.graph, e);
            }
        }
        return allowed;
    }
    dispose() {
        this.mousetrap.reset();
    }
}
__decorate([
    disposable()
], KeyboardImpl.prototype, "dispose", null);
//# sourceMappingURL=keyboard.js.map