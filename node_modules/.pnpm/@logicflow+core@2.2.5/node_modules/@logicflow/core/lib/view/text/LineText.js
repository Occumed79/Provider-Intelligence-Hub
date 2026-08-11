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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineText = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var __1 = require("..");
var _1 = require(".");
var util_1 = require("../../util");
var LineText = /** @class */ (function (_super) {
    __extends(LineText, _super);
    function LineText(props) {
        var _this = _super.call(this, props) || this;
        // Hover 状态相关
        _this.setHoverOn = function () {
            _this.setState({
                isHovered: true,
            });
        };
        _this.setHoverOff = function () {
            _this.setState({
                isHovered: false,
            });
        };
        _this.state = {
            isHovered: false,
        };
        return _this;
    }
    LineText.prototype.getBackground = function () {
        var isHovered = this.state.isHovered;
        var model = this.props.model;
        var text = model.text;
        var style = model.getTextStyle();
        var backgroundStyle = style.background || {};
        if (isHovered && style.hover && style.hover.background) {
            backgroundStyle = __assign(__assign({}, backgroundStyle), style.hover.background);
        }
        // 当存在文本并且文本背景不为透明时，计算背景框
        if ((text === null || text === void 0 ? void 0 : text.value) && (backgroundStyle === null || backgroundStyle === void 0 ? void 0 : backgroundStyle.fill) !== 'transparent') {
            var fontSize = style.fontSize, textWidth = style.textWidth, lineHeight = style.lineHeight, overflowMode = style.overflowMode;
            var wrapPadding = backgroundStyle.wrapPadding;
            var rows = text === null || text === void 0 ? void 0 : text.value.split(/[\r\n]/g);
            var rowsLength = rows.length;
            var x = text.x, y = text.y;
            var rectAttr = {};
            if (overflowMode === 'autoWrap' && textWidth) {
                var textHeight = (0, util_1.getHtmlTextHeight)({
                    rows: rows,
                    style: {
                        fontSize: "".concat(fontSize, "px"),
                        width: "".concat(textWidth, "px"),
                        lineHeight: lineHeight,
                        padding: wrapPadding,
                    },
                    rowsLength: rowsLength,
                    className: 'lf-get-text-height',
                });
                rectAttr = __assign(__assign({}, backgroundStyle), { x: x, y: y, width: textWidth, height: textHeight });
            }
            else {
                // 背景框宽度，最长一行字节数 / 2 * fontSize + 2
                // 背景框宽度，行数 * fontSize + 2
                var _a = (0, util_1.getSvgTextSize)({ rows: rows, rowsLength: rowsLength, fontSize: fontSize }), width = _a.width, height = _a.height;
                if (overflowMode === 'ellipsis') {
                    // https://github.com/didi/LogicFlow/issues/1151
                    // 边上的文字过长（使用"ellipsis"模式）出现省略号，背景也需要进行宽度的重新计算
                    // 跟Text.tsx保持同样的计算逻辑(overflowMode === 'ellipsis')
                    // Text.tsx使用textRealWidth=textWidth || width
                    // Text.tsx使用foreignObjectHeight = fontSize + 2;
                    width = textWidth;
                    height = fontSize + 2;
                }
                // 根据设置的 padding 调整 width, height, x, y 的值
                // TODO: 下面方法感觉可以提取成工具方法
                if (typeof backgroundStyle.wrapPadding === 'string') {
                    var padding = backgroundStyle.wrapPadding
                        .split(',')
                        .filter(function (padding) { return padding.trim(); })
                        .map(function (padding) { return parseFloat(padding.trim()); });
                    if (padding.length > 0 && padding.length <= 4) {
                        if (padding.length === 1) {
                            var _b = __read(padding, 1), allSides = _b[0];
                            padding = [allSides, allSides, allSides, allSides];
                        }
                        else if (padding.length === 2) {
                            var _c = __read(padding, 2), vertical = _c[0], horizontal = _c[1];
                            padding = [vertical, horizontal, vertical, horizontal];
                        }
                        else if (padding.length === 3) {
                            var _d = __read(padding, 3), top_1 = _d[0], horizontal = _d[1], bottom_1 = _d[2];
                            padding = [top_1, horizontal, bottom_1, horizontal];
                        }
                        var _e = __read(padding, 4), top_2 = _e[0], right = _e[1], bottom = _e[2], left = _e[3];
                        width += right + left;
                        height += top_2 + bottom;
                        x = x + (right - left) / 2;
                        y = y + (bottom - top_2) / 2;
                    }
                }
                rectAttr = __assign(__assign({}, backgroundStyle), { x: x - 1, y: y - 1, width: width, height: height });
            }
            return (0, jsx_runtime_1.jsx)(__1.Rect, __assign({}, rectAttr));
        }
        return null;
    };
    LineText.prototype.getShape = function () {
        var model = this.props.model;
        var _a = model.text, x = _a.x, y = _a.y, value = _a.value;
        if (!value)
            return null;
        var style = model.getTextStyle();
        var attrs = __assign({ x: x, y: y, value: value, model: model, className: 'lf-element-text' }, style);
        return ((0, jsx_runtime_1.jsxs)("g", { className: "lf-line-text", onMouseEnter: this.setHoverOn, onMouseLeave: this.setHoverOff, children: [this.getBackground(), (0, jsx_runtime_1.jsx)(__1.Text, __assign({}, attrs))] }));
    };
    return LineText;
}(_1.BaseText));
exports.LineText = LineText;
exports.default = LineText;
