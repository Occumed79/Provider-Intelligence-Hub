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
exports.Grid = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var compat_1 = require("preact/compat");
var lodash_es_1 = require("lodash-es");
var __1 = require("../..");
var gridConfig_1 = require("./gridConfig");
var util_1 = require("../../util");
var constant_1 = require("../../constant");
var Grid = /** @class */ (function (_super) {
    __extends(Grid, _super);
    function Grid(props) {
        var _this = _super.call(this, props) || this;
        _this.id = (0, util_1.createUuid)();
        _this.gridOptions = _this.props.graphModel.grid;
        return _this;
    }
    // 网格类型为点状
    Grid.prototype.renderDot = function () {
        var _a = this.gridOptions, config = _a.config, _b = _a.size, size = _b === void 0 ? 1 : _b, visible = _a.visible;
        var _c = config !== null && config !== void 0 ? config : {}, color = _c.color, _d = _c.thickness, thickness = _d === void 0 ? 2 : _d;
        // 对于点状网格，点的半径不能大于网格大小的四分之一
        var radius = Math.min(Math.max(2, thickness), size / 4);
        var opacity = visible ? 1 : 0;
        return ((0, jsx_runtime_1.jsxs)("g", { fill: color, opacity: opacity, children: [(0, jsx_runtime_1.jsx)("circle", { cx: 0, cy: 0, r: radius / 2 }), (0, jsx_runtime_1.jsx)("circle", { cx: 0, cy: size, r: radius / 2 }), (0, jsx_runtime_1.jsx)("circle", { cx: size, cy: 0, r: radius / 2 }), (0, jsx_runtime_1.jsx)("circle", { cx: size, cy: size, r: radius / 2 })] }));
    };
    // 计算与 size 整除的虚线周期，使边长能被 (dash + gap) 完整分割
    Grid.prototype.getDashArrayForSize = function (dashCfg) {
        var _a;
        // 若提供了直接可用的 pattern，则优先使用
        var direct = (_a = dashCfg === null || dashCfg === void 0 ? void 0 : dashCfg.pattern) === null || _a === void 0 ? void 0 : _a.filter(function (n) { return typeof n === 'number' && n > 0; });
        return (direct === null || direct === void 0 ? void 0 : direct.join(',')) || '2,1';
    };
    // 计算一个周期内的最大加粗索引（作为周期大小）
    Grid.prototype.getPeriod = function (advanced) {
        var list = Array.isArray(advanced === null || advanced === void 0 ? void 0 : advanced.boldIndices)
            ? advanced.boldIndices.filter(function (n) { return typeof n === 'number' && n > 0; })
            : [];
        return list.length ? Math.max.apply(Math, __spreadArray([], __read(list), false)) : 0;
    };
    // 计算加粗线宽，优先使用自定义；否则根据周期与厚度估算
    Grid.prototype.getBoldStrokeWidth = function (advanced, size, thickness, period) {
        if (typeof (advanced === null || advanced === void 0 ? void 0 : advanced.customBoldWidth) === 'number')
            return advanced.customBoldWidth;
        var baseThickness = Math.max(1, thickness !== null && thickness !== void 0 ? thickness : 1);
        var p = Math.max(1, period !== null && period !== void 0 ? period : this.getPeriod(advanced));
        return Math.min(baseThickness, (size * p) / 2) / 2;
    };
    // 渲染 mesh 类型四条边的虚线，减少重复代码
    Grid.prototype.renderMeshEdgeLines = function (size, color, strokeWidth, opacity, dash) {
        var segments = [
            { d: "M 0 0 H ".concat(size) },
            { d: "M 0 ".concat(size, " H ").concat(size) },
            { d: "M 0 0 V ".concat(size) },
            { d: "M ".concat(size, " 0 V ").concat(size) },
        ];
        return ((0, jsx_runtime_1.jsx)("g", { opacity: opacity, fill: "transparent", children: segments.map(function (seg) { return ((0, jsx_runtime_1.jsx)("path", { d: seg.d, stroke: color, strokeWidth: strokeWidth / 2, strokeDasharray: dash, strokeLinecap: "butt", fill: "transparent" })); }) }));
    };
    // 网格类型为交叉线
    // todo: 采用背景缩放的方式，实现更好的体验
    Grid.prototype.renderMesh = function () {
        var _a, _b;
        var _c = this.gridOptions, config = _c.config, _d = _c.size, size = _d === void 0 ? 1 : _d, visible = _c.visible, majorBold = _c.majorBold;
        var advanced = (0, gridConfig_1.mergeMajorBoldConfig)(majorBold).config;
        var baseOpacity = advanced.opacity;
        var color = ((_a = config === null || config === void 0 ? void 0 : config.color) !== null && _a !== void 0 ? _a : '#D7DEEB');
        var thickness = ((_b = config === null || config === void 0 ? void 0 : config.thickness) !== null && _b !== void 0 ? _b : 1);
        // 对于交叉线网格，线的宽度不能大于网格大小的一半
        var strokeWidth = Math.min(Math.max(1, thickness), size / 2);
        var opacity = visible ? baseOpacity : 0;
        // 根据 size 自动计算合适的 dash/gap 周期，使 size 能被 (dash + gap) 整除
        var dash = majorBold === false
            ? undefined
            : this.getDashArrayForSize(advanced.dashArrayConfig);
        return this.renderMeshEdgeLines(size, color, strokeWidth, opacity, dash);
    };
    Grid.prototype.render = function () {
        var _this = this;
        var _a, _b, _c;
        var _d = this.props.graphModel, transformModel = _d.transformModel, grid = _d.grid;
        this.gridOptions = grid;
        var _e = this.gridOptions, type = _e.type, _f = _e.config, config = _f === void 0 ? {} : _f, _g = _e.size, size = _g === void 0 ? 1 : _g, majorBold = _e.majorBold;
        var showMajorBold = majorBold !== false && !(0, lodash_es_1.isNil)(majorBold);
        var advanced = (0, gridConfig_1.mergeMajorBoldConfig)(majorBold).config;
        var SCALE_X = transformModel.SCALE_X, SKEW_Y = transformModel.SKEW_Y, SKEW_X = transformModel.SKEW_X, SCALE_Y = transformModel.SCALE_Y, TRANSLATE_X = transformModel.TRANSLATE_X, TRANSLATE_Y = transformModel.TRANSLATE_Y;
        var matrixString = [
            SCALE_X,
            SKEW_Y,
            SKEW_X,
            SCALE_Y,
            TRANSLATE_X,
            TRANSLATE_Y,
        ].join(',');
        var transform = "matrix(".concat(matrixString, ")");
        var radius = Math.min(Math.max(2, (_a = config.thickness) !== null && _a !== void 0 ? _a : 1), size / 4);
        var opacity = showMajorBold ? advanced.opacity : 1;
        return ((0, jsx_runtime_1.jsx)("div", { className: "lf-grid", children: (0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", version: "1.1", width: "100%", height: "100%", children: [(0, jsx_runtime_1.jsxs)("defs", { children: [(0, jsx_runtime_1.jsxs)("pattern", { id: this.id, patternUnits: "userSpaceOnUse", patternTransform: transform, x: "0", y: "0", width: size, height: size, children: [type === 'dot' && this.renderDot(), type === 'mesh' && this.renderMesh()] }), type === 'dot' && advanced.boldIndices.length ? ((0, jsx_runtime_1.jsx)("pattern", { id: "".concat(this.id, "-dot-major"), patternUnits: "userSpaceOnUse", patternTransform: transform, x: "0", y: "0", width: size * this.getPeriod(advanced), height: size * this.getPeriod(advanced), children: (0, jsx_runtime_1.jsxs)("g", { fill: (_c = (_b = this.gridOptions.config) === null || _b === void 0 ? void 0 : _b.color) !== null && _c !== void 0 ? _c : '#D7DEEB', opacity: this.gridOptions.visible ? opacity : 0, children: [(0, jsx_runtime_1.jsx)("circle", { cx: 0, cy: 0, r: (radius * 1.5) / 2 }), (0, jsx_runtime_1.jsx)("circle", { cx: size * this.getPeriod(advanced), cy: 0, r: (radius * 1.5) / 2 }), (0, jsx_runtime_1.jsx)("circle", { cx: 0, cy: size * this.getPeriod(advanced), r: (radius * 1.5) / 2 }), (0, jsx_runtime_1.jsx)("circle", { cx: size * this.getPeriod(advanced), cy: size * this.getPeriod(advanced), r: (radius * 1.5) / 2 })] }) })) : null, type === 'mesh' && advanced.boldIndices.length ? ((0, jsx_runtime_1.jsx)("pattern", { id: "".concat(this.id, "-major"), patternUnits: "userSpaceOnUse", patternTransform: transform, x: "0", y: "0", width: size * this.getPeriod(advanced), height: size * this.getPeriod(advanced), children: advanced.boldIndices.map(function (i) {
                                    var _a, _b, _c, _d, _e, _f;
                                    return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)("path", { d: "M ".concat(size * i, " 0 V ").concat(size * _this.getPeriod(advanced)), stroke: (_b = (_a = _this.gridOptions.config) === null || _a === void 0 ? void 0 : _a.color) !== null && _b !== void 0 ? _b : '#D7DEEB', strokeWidth: _this.getBoldStrokeWidth(advanced, size, ((_c = _this.gridOptions.config) !== null && _c !== void 0 ? _c : {}).thickness, _this.getPeriod(advanced)), opacity: _this.gridOptions.visible ? opacity : 0, fill: "transparent" }), (0, jsx_runtime_1.jsx)("path", { d: "M 0 ".concat(size * i, " H ").concat(size * _this.getPeriod(advanced)), stroke: (_e = (_d = _this.gridOptions.config) === null || _d === void 0 ? void 0 : _d.color) !== null && _e !== void 0 ? _e : '#D7DEEB', strokeWidth: _this.getBoldStrokeWidth(advanced, size, ((_f = _this.gridOptions.config) !== null && _f !== void 0 ? _f : {}).thickness, _this.getPeriod(advanced)), opacity: _this.gridOptions.visible ? opacity : 0, fill: "transparent" })] }));
                                }) })) : null] }), (0, jsx_runtime_1.jsx)("rect", { width: "100%", height: "100%", fill: "url(#".concat(this.id, ")") }), type === 'dot' && showMajorBold && advanced.boldIndices.length ? ((0, jsx_runtime_1.jsx)("rect", { width: "100%", height: "100%", fill: "url(#".concat(this.id, "-dot-major)") })) : null, type === 'mesh' && showMajorBold && advanced.boldIndices.length ? ((0, jsx_runtime_1.jsx)("rect", { width: "100%", height: "100%", fill: "url(#".concat(this.id, "-major)") })) : null] }) }));
    };
    Grid = __decorate([
        __1.observer
    ], Grid);
    return Grid;
}(compat_1.Component));
exports.Grid = Grid;
(function (Grid) {
    function getGridOptions(options) {
        var defaultOptions = (0, lodash_es_1.cloneDeep)(constant_1.defaultGrid);
        if (typeof options === 'number') {
            return (0, lodash_es_1.assign)(defaultOptions, { size: options });
        }
        else if (typeof options === 'boolean') {
            return (0, lodash_es_1.assign)(defaultOptions, { visible: options });
        }
        else {
            return (0, lodash_es_1.assign)(defaultOptions, options);
        }
    }
    Grid.getGridOptions = getGridOptions;
})(Grid || (exports.Grid = Grid = {}));
