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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("preact/jsx-runtime");
var compat_1 = require("preact/compat");
var lodash_es_1 = require("lodash-es");
var overlay_1 = require("./overlay");
var __1 = require("..");
var constant_1 = require("../constant");
var Graph = /** @class */ (function (_super) {
    __extends(Graph, _super);
    function Graph() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.handleResize = function () {
            var _a = _this.props, graphModel = _a.graphModel, options = _a.options;
            var width = graphModel.width, height = graphModel.height, isContainerWidth = graphModel.isContainerWidth, isContainerHeight = graphModel.isContainerHeight;
            var resizeWidth = width;
            var resizeHeight = height;
            var needUpdate = false;
            if (isContainerWidth) {
                resizeWidth = undefined;
                needUpdate = true;
            }
            if (isContainerHeight) {
                resizeHeight = undefined;
                needUpdate = true;
            }
            if (needUpdate) {
                graphModel.resize(resizeWidth, resizeHeight);
            }
            options.width = width;
            options.height = height;
        };
        _this.throttleResize = (0, lodash_es_1.throttle)(_this.handleResize, 200);
        return _this;
    }
    Graph.prototype.componentDidMount = function () {
        window.addEventListener('resize', this.throttleResize);
    };
    Graph.prototype.componentDidUpdate = function () {
        var data = this.props.graphModel.modelToGraphData();
        this.props.graphModel.eventCenter.emit(constant_1.EventType.GRAPH_UPDATED, { data: data });
    };
    Graph.prototype.componentWillUnmount = function () {
        window.removeEventListener('resize', this.throttleResize);
    };
    Graph.prototype.getComponent = function (model, graphModel, overlay) {
        if (overlay === void 0) { overlay = 'canvas-overlay'; }
        var getView = this.props.getView;
        // https://juejin.cn/post/7046639346656493582 - 几种方式来声明React Component的类型
        var View = getView(model.type);
        if (View) {
            return ((0, jsx_runtime_1.jsx)(View, { model: model, graphModel: graphModel, overlay: overlay }, model.id));
        }
        return null;
    };
    Graph.prototype.render = function () {
        var _this = this;
        var _a = this.props, graphModel = _a.graphModel, tool = _a.tool, options = _a.options, dnd = _a.dnd, snaplineModel = _a.snaplineModel;
        var style = {};
        // 如果初始化的时候，不传宽高，则默认为父容器宽高。
        if (options.width) {
            style.width = "".concat(graphModel.width, "px");
        }
        if (options.height) {
            style.height = "".concat(graphModel.height, "px");
        }
        var fakeNode = graphModel.fakeNode, editConfigModel = graphModel.editConfigModel, background = graphModel.background;
        var adjustEdge = editConfigModel.adjustEdge;
        return ((0, jsx_runtime_1.jsxs)("div", { className: "lf-graph", "flow-id": graphModel.flowId, style: style, children: [(0, jsx_runtime_1.jsxs)(overlay_1.CanvasOverlay, { graphModel: graphModel, dnd: dnd, children: [(0, jsx_runtime_1.jsx)("g", { className: "lf-base", children: (0, lodash_es_1.map)(graphModel.sortElements, function (nodeModel) {
                                return _this.getComponent(nodeModel, graphModel);
                            }) }), fakeNode ? this.getComponent(fakeNode, graphModel) : ''] }), (0, jsx_runtime_1.jsxs)(overlay_1.ModificationOverlay, { graphModel: graphModel, children: [(0, jsx_runtime_1.jsx)(overlay_1.OutlineOverlay, { graphModel: graphModel }), adjustEdge ? (0, jsx_runtime_1.jsx)(overlay_1.BezierAdjustOverlay, { graphModel: graphModel }) : '', options.snapline !== false ? ((0, jsx_runtime_1.jsx)(overlay_1.SnaplineOverlay, { snaplineModel: snaplineModel })) : ('')] }), (0, jsx_runtime_1.jsx)(overlay_1.ToolOverlay, { graphModel: graphModel, tool: tool }), background && (0, jsx_runtime_1.jsx)(overlay_1.BackgroundOverlay, { background: background }), (0, jsx_runtime_1.jsx)(overlay_1.Grid, { graphModel: graphModel })] }));
    };
    Graph = __decorate([
        __1.observer
    ], Graph);
    return Graph;
}(compat_1.Component));
exports.default = Graph;
