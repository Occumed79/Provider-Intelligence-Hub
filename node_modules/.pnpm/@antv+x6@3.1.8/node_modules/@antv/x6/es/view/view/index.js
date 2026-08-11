import { __decorate } from "tslib";
import { Basecoat, Dom, disposable, StringExt, } from '../../common';
import { Config } from '../../config';
import { normalizeEvent, registerView, unregisterView, viewFind } from './util';
export class View extends Basecoat {
    get priority() {
        return 2;
    }
    /** If need remove `this.container` DOM */
    get disposeContainer() {
        return true;
    }
    constructor() {
        super();
        this.cid = StringExt.uniqueId('v');
        registerView(this.cid, this);
    }
    confirmUpdate(flag, options) {
        return 0;
    }
    empty(elem = this.container) {
        Dom.empty(elem);
        return this;
    }
    unmount(elem = this.container) {
        Dom.remove(elem);
        return this;
    }
    remove(elem = this.container) {
        if (elem === this.container) {
            this.removeEventListeners(document);
            this.onRemove();
            unregisterView(this.cid);
            if (this.disposeContainer) {
                this.unmount(elem);
            }
        }
        else {
            this.unmount(elem);
        }
        return this;
    }
    onRemove() { }
    setClass(className, elem = this.container) {
        elem.classList.value = Array.isArray(className)
            ? className.join(' ')
            : className;
    }
    addClass(className, elem = this.container) {
        Dom.addClass(elem, Array.isArray(className) ? className.join(' ') : className);
        return this;
    }
    removeClass(className, elem = this.container) {
        Dom.removeClass(elem, Array.isArray(className) ? className.join(' ') : className);
        return this;
    }
    setStyle(style, elem = this.container) {
        Dom.css(elem, style);
        return this;
    }
    setAttrs(attrs, elem = this.container) {
        if (attrs != null && elem != null) {
            Dom.attr(elem, attrs);
        }
        return this;
    }
    /**
     * Returns the value of the specified attribute of `node`.
     *
     * If the node does not set a value for attribute, start recursing up
     * the DOM tree from node to lookup for attribute at the ancestors of
     * node. If the recursion reaches CellView's root node and attribute
     * is not found even there, return `null`.
     */
    findAttr(attrName, elem = this.container) {
        let current = elem;
        while (current && current.nodeType === 1) {
            const value = current.getAttribute(attrName);
            if (value != null) {
                return value;
            }
            if (current === this.container) {
                return null;
            }
            current = current.parentNode;
        }
        return null;
    }
    find(selector, rootElem = this.container, selectors = this.selectors) {
        return viewFind(selector, rootElem, selectors).elems;
    }
    findOne(selector, rootElem = this.container, selectors = this.selectors) {
        const nodes = this.find(selector, rootElem, selectors);
        return nodes.length > 0 ? nodes[0] : null;
    }
    findByAttr(attrName, elem = this.container) {
        let node = elem;
        while (node === null || node === void 0 ? void 0 : node.getAttribute) {
            const val = node.getAttribute(attrName);
            if ((val != null || node === this.container) && val !== 'false') {
                return node;
            }
            node = node.parentNode;
        }
        // If the overall cell has set `magnet === false`, then returns
        // `null` to announce there is no magnet found for this cell.
        // This is especially useful to set on cells that have 'ports'.
        // In this case, only the ports have set `magnet === true` and the
        // overall element has `magnet === false`.
        return null;
    }
    getSelector(elem, prevSelector) {
        let selector;
        if (elem === this.container) {
            if (typeof prevSelector === 'string') {
                selector = `> ${prevSelector}`;
            }
            return selector;
        }
        if (elem) {
            const nth = Dom.index(elem) + 1;
            selector = `${elem.tagName.toLowerCase()}:nth-child(${nth})`;
            if (prevSelector) {
                selector += ` > ${prevSelector}`;
            }
            selector = this.getSelector(elem.parentNode, selector);
        }
        return selector;
    }
    prefixClassName(className) {
        return Config.prefix(className);
    }
    delegateEvents(events, append) {
        if (events == null) {
            return this;
        }
        if (!append) {
            this.undelegateEvents();
        }
        const splitter = /^(\S+)\s*(.*)$/;
        Object.keys(events).forEach((key) => {
            const match = key.match(splitter);
            if (match == null) {
                return;
            }
            const method = this.getEventHandler(events[key]);
            if (typeof method === 'function') {
                this.delegateEvent(match[1], match[2], method);
            }
        });
        return this;
    }
    undelegateEvents() {
        Dom.Event.off(this.container, this.getEventNamespace());
        return this;
    }
    delegateDocumentEvents(events, data) {
        this.addEventListeners(document, events, data);
        return this;
    }
    undelegateDocumentEvents() {
        this.removeEventListeners(document);
        return this;
    }
    delegateEvent(eventName, selector, listener) {
        Dom.Event.on(this.container, eventName + this.getEventNamespace(), selector, listener);
        return this;
    }
    undelegateEvent(eventName, selector, listener) {
        const name = eventName + this.getEventNamespace();
        if (selector == null) {
            Dom.Event.off(this.container, name);
        }
        else if (typeof selector === 'string') {
            Dom.Event.off(this.container, name, selector, listener);
        }
        else {
            Dom.Event.off(this.container, name, selector);
        }
        return this;
    }
    addEventListeners(elem, events, data) {
        if (events == null) {
            return this;
        }
        const ns = this.getEventNamespace();
        Object.keys(events).forEach((eventName) => {
            const method = this.getEventHandler(events[eventName]);
            if (typeof method === 'function') {
                Dom.Event.on(elem, eventName + ns, data, method);
            }
        });
        return this;
    }
    removeEventListeners(elem) {
        if (elem != null) {
            Dom.Event.off(elem, this.getEventNamespace());
        }
        return this;
    }
    getEventNamespace() {
        return `.${Config.prefixCls}-event-${this.cid}`;
    }
    getEventHandler(handler) {
        let method;
        if (typeof handler === 'string') {
            const fn = this[handler];
            if (typeof fn === 'function') {
                method = (...args) => fn.call(this, ...args);
            }
        }
        else {
            method = (...args) => handler.call(this, ...args);
        }
        return method;
    }
    getEventTarget(e, options = {}) {
        // Touchmove/Touchend event's target is not reflecting the element
        // under the coordinates as mousemove does.
        // It holds the element when a touchstart triggered.
        const { target, type, clientX = 0, clientY = 0 } = e;
        if (options.fromPoint || type === 'touchmove' || type === 'touchend') {
            return document.elementFromPoint(clientX, clientY);
        }
        return target;
    }
    stopPropagation(e) {
        this.setEventData(e, { propagationStopped: true });
        return this;
    }
    isPropagationStopped(e) {
        return this.getEventData(e).propagationStopped === true;
    }
    getEventData(e) {
        return this.eventData(e);
    }
    setEventData(e, data) {
        return this.eventData(e, data);
    }
    eventData(e, data) {
        if (e == null) {
            throw new TypeError('Event object required');
        }
        let currentData = e.data;
        const key = `__${this.cid}__`;
        // get
        if (data == null) {
            if (currentData == null) {
                return {};
            }
            return currentData[key] || {};
        }
        // set
        if (currentData == null) {
            currentData = e.data = {};
        }
        if (currentData[key] == null) {
            currentData[key] = Object.assign({}, data);
        }
        else {
            currentData[key] = Object.assign(Object.assign({}, currentData[key]), data);
        }
        return currentData[key];
    }
    normalizeEvent(evt) {
        return normalizeEvent(evt);
    }
    dispose() {
        this.remove();
    }
}
__decorate([
    disposable()
], View.prototype, "dispose", null);
//# sourceMappingURL=index.js.map