"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderHtmlText = exports.Text = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var constant_1 = require("../../constant");
var util_1 = require("../../util");
var lodash_es_1 = require("lodash-es");
function Text(props) {
    var _a = props.x, x = _a === void 0 ? 0 : _a, _b = props.y, y = _b === void 0 ? 0 : _b, value = props.value, _c = props.fontSize, fontSize = _c === void 0 ? 12 : _c, _d = props.fill, fill = _d === void 0 ? 'currentColor' : _d, _e = props.overflowMode, overflowMode = _e === void 0 ? 'default' : _e, 
    // TODO: 确认该 textWidth 为 '' 时跟设置什么值一致
    _f = props.textWidth, 
    // TODO: 确认该 textWidth 为 '' 时跟设置什么值一致
    textWidth = _f === void 0 ? undefined : _f, model = props.model;
    var attrs = {
        x: x,
        y: y,
        fill: fill,
        fontSize: fontSize,
        textAnchor: 'middle',
        dominantBaseline: 'central',
        // ...props,
    };
    (0, lodash_es_1.forEach)((0, lodash_es_1.toPairs)(props), function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        if (typeof v !== 'object') {
            attrs[k] = v;
        }
    });
    if (value) {
        // String(value)，兼容纯数字的文案
        // TODO: 将 value 转为纯文本，移除其中 \n \r 等特殊字符，看是否应该丰富该功能
        var rows = String(value).split(/[\r\n]/g);
        var rowsLength_1 = rows.length;
        if (overflowMode !== 'default') {
            // 非文本节点设置了自动换行，或者边设置了自动换行并且设置了 textWidth
            var BaseType = model.BaseType, modelType = model.modelType;
            if ((BaseType === constant_1.ElementType.NODE && modelType !== constant_1.ModelType.TEXT_NODE) ||
                (BaseType === constant_1.ElementType.EDGE && textWidth)) {
                return renderHtmlText(props);
            }
        }
        if (rowsLength_1 > 1) {
            var tSpans = rows.map(function (row, idx) {
                // 保证文字居中，文字 Y 轴偏移为当前行数对应中心行数的偏移行 * 行高
                var tSpanLineHeight = fontSize + 2;
                var offsetY = (idx - (rowsLength_1 - 1) / 2) * tSpanLineHeight;
                return ((0, jsx_runtime_1.jsx)("tspan", { className: "lf-text-tspan", x: x, y: y + offsetY, children: row }));
            });
            return (0, jsx_runtime_1.jsx)("text", __assign({}, attrs, { children: tSpans }));
        }
        return (0, jsx_runtime_1.jsx)("text", __assign({}, attrs, { children: value }));
    }
    return null;
}
exports.Text = Text;
function renderHtmlText(props) {
    var x = props.x, y = props.y, value = props.value, model = props.model, textWidth = props.textWidth, _a = props.fontSize, fontSize = _a === void 0 ? 12 : _a, lineHeight = props.lineHeight, _b = props.fontFamily, fontFamily = _b === void 0 ? '' : _b, _c = props.wrapPadding, wrapPadding = _c === void 0 ? '0, 0' : _c, overflowMode = props.overflowMode;
    var width = model.width, height = model.height, textHeight = model.textHeight;
    // TODO: 设置文本宽度为 textWidth 或 节点的宽度
    var textRealWidth = textWidth || width;
    var rows = String(value).split(/[\r\n]/g);
    var rowsLength = rows.length;
    var textRealHeight = (0, util_1.getHtmlTextHeight)({
        rows: rows,
        style: {
            fontSize: "".concat(fontSize, "px"),
            width: "".concat(textRealWidth, "px"),
            fontFamily: fontFamily,
            lineHeight: lineHeight,
            padding: wrapPadding,
        },
        rowsLength: rowsLength,
        className: 'lf-get-text-height',
    });
    // 当文字超过边框时，取文字高度的实际值，也就是文字可以超过边框
    var foreignObjectHeight = height > textRealHeight ? height : textRealHeight;
    // 如果设置了文本高度，取设置的高度
    if (textHeight) {
        foreignObjectHeight = textHeight;
    }
    var isEllipsis = overflowMode === 'ellipsis';
    if (isEllipsis) {
        foreignObjectHeight = fontSize + 2;
    }
    return ((0, jsx_runtime_1.jsx)("g", { children: (0, jsx_runtime_1.jsx)("foreignObject", { width: textRealWidth, height: foreignObjectHeight, x: x - textRealWidth / 2, y: y - foreignObjectHeight / 2, style: { overflow: 'visible', textAlign: 'left' }, children: (0, jsx_runtime_1.jsx)("div", { className: "lf-node-text-auto-wrap", style: {
                    minHeight: foreignObjectHeight,
                    width: textRealWidth,
                    padding: wrapPadding,
                }, children: (0, jsx_runtime_1.jsx)("div", { className: isEllipsis
                        ? 'lf-node-text-ellipsis-content'
                        : 'lf-node-text-auto-wrap-content', title: isEllipsis ? rows.join('') : '', style: __assign({}, props), children: rows.map(function (row) { return ((0, jsx_runtime_1.jsx)("div", { className: "lf-node-text--auto-wrap-inner", children: row })); }) }) }) }) }));
}
exports.renderHtmlText = renderHtmlText;
exports.default = Text;
