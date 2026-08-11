"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlNode = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var compat_1 = require("preact/compat");
var BaseNode_1 = __importDefault(require("./BaseNode"));
var HtmlNode = /** @class */ (function (_super) {
    __extends(HtmlNode, _super);
    function HtmlNode() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.ref = (0, compat_1.createRef)();
        return _this;
    }
    Object.defineProperty(HtmlNode.prototype, "rootEl", {
        get: function () {
            return this.ref.current;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @overridable 支持重写
     * 自定义HTML节点内容
     * @param {HTMLElement} rootEl 自定义HTML节点内容可以挂载的dom节点
     * @example
     * class CustomHtmlNode extends HtmlNode {
     *   setHtml(rootEl) {
     *     const input = document.createElement('input');
     *     rootEl.appendChild(input)
     *   }
     * }
     */
    HtmlNode.prototype.setHtml = function (rootEl) {
        rootEl.appendChild(document.createElement('div'));
    };
    // TODO: 1. 应该在什么时机进行更新呢？2. 如何精细化控制
    HtmlNode.prototype.confirmUpdate = function (rootEl) {
        this.setHtml(rootEl);
    };
    /**
     * @overridable 支持重写
     * 和react的shouldComponentUpdate类似，都是为了避免出发不必要的render.
     * 但是这里不一样的地方在于，setHtml方法，我们只在properties发生变化了后再触发。
     * 而x,y等这些坐标相关的方法发生了变化，不会再重新触发setHtml.
     */
    HtmlNode.prototype.shouldUpdate = function () {
        if (this.preProperties && this.preProperties === this.currentProperties) {
            return false;
        }
        this.preProperties = this.currentProperties;
        return true;
    };
    HtmlNode.prototype.componentDidMount = function () {
        if (this.shouldUpdate() && this.rootEl) {
            this.setHtml(this.rootEl);
        }
    };
    HtmlNode.prototype.componentDidUpdate = function () {
        // DONE: 将 componentDidMount 和 componentDidUpdate 区分开，如果写在一次，渲染 React 组件会重复初始化，消耗过多资源
        // 为了保证历史兼容性，先将默认 HTML 节点的 setHtml 和 confirmUpdate 保持一直，用户可通过自定义的方式重新定义
        if (this.shouldUpdate() && this.rootEl) {
            this.confirmUpdate(this.rootEl);
        }
    };
    HtmlNode.prototype.componentWillUnmount = function () {
        _super.prototype.componentWillUnmount.call(this);
        this.rootEl.innerHTML = '';
    };
    HtmlNode.prototype.getShape = function () {
        var model = this.props.model;
        var x = model.x, y = model.y, height = model.height, width = model.width;
        var style = model.getNodeStyle();
        this.currentProperties = JSON.stringify(model.properties);
        return ((0, jsx_runtime_1.jsxs)("g", { children: [style.shadow && ((0, jsx_runtime_1.jsx)("defs", { children: (0, jsx_runtime_1.jsx)("filter", { id: "shadow", x: "-50%", y: "-50%", width: "200%", height: "200%", children: (0, jsx_runtime_1.jsx)("feDropShadow", __assign({}, style.shadow)) }) })), (0, jsx_runtime_1.jsx)("rect", __assign({ x: x - width / 2, y: y - height / 2, width: width, height: height, rx: style.radius, ry: style.radius }, style, { filter: "url(#shadow)" })), (0, jsx_runtime_1.jsx)("foreignObject", __assign({}, style, { x: x - width / 2, y: y - height / 2, width: width, height: height, ref: this.ref }))] }));
    };
    return HtmlNode;
}(BaseNode_1.default));
exports.HtmlNode = HtmlNode;
exports.default = HtmlNode;
