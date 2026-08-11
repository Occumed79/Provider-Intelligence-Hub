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
import { jsx as _jsx } from "preact/jsx-runtime";
import { createRef, Component } from 'preact/compat';
import { ElementState, observer } from '..';
import { ElementType, EventType, ModelType } from '../constant';
var TextEditTool = /** @class */ (function (_super) {
    __extends(TextEditTool, _super);
    function TextEditTool(props) {
        var _this = _super.call(this, props) || this;
        _this.ref = createRef();
        _this.__prevText = {
            type: '',
            text: '',
            id: '',
        };
        _this.keyupHandler = function (ev) {
            var textEditElement = _this.props.graphModel.textEditElement;
            // 按下alt+enter表示输入完成
            if (ev.key === 'Enter' && ev.altKey) {
                textEditElement === null || textEditElement === void 0 ? void 0 : textEditElement.setElementState(ElementState.DEFAULT);
            }
        };
        _this.inputHandler = function (ev) {
            var value = ev.target.innerText;
            var textEditElement = _this.props.graphModel.textEditElement;
            if (textEditElement) {
                _this.__prevText = {
                    type: textEditElement.type,
                    text: value.replace(/(\r\n)+$|(\n)+$/, ''), // fix #488: 文本后面的换行符不保留
                    id: textEditElement.id,
                };
            }
        };
        // fix: #587 #760
        _this.keydownHandler = function (ev) {
            ev.stopPropagation();
        };
        _this.state = {
            style: {
                left: 0,
                top: 0,
            },
        };
        return _this;
    }
    TextEditTool.getDerivedStateFromProps = function (props) {
        var _a;
        var textEditElement = props.textEditElement, graphModel = props.graphModel;
        var transformModel = graphModel.transformModel, theme = graphModel.theme;
        var inputText = theme.inputText;
        var autoStyle;
        if (textEditElement) {
            // 由于边上的文本是依据显示的时候动态计算出来的
            // 所以不能在边创建的时候就初始化文本位置。
            // 而是在边上新建文本的时候创建。
            if (!((_a = textEditElement.text) === null || _a === void 0 ? void 0 : _a.value)) {
                if (textEditElement.BaseType === ElementType.EDGE) {
                    // textEditElement = textEditElement as BaseEdgeModel
                    var textConfig = textEditElement.text;
                    var _b = textEditElement.textPosition, x_1 = _b.x, y_1 = _b.y;
                    textConfig.x = x_1;
                    textConfig.y = y_1;
                    textEditElement.setText(textConfig);
                }
            }
            // 自动换行节点边通用样式
            var commonAutoStyle = {
                resize: 'auto',
                whiteSpace: 'normal',
                wordBreak: 'break-all',
            };
            if (textEditElement.BaseType === ElementType.EDGE) {
                // 如果边文案自动换行, 设置编辑框宽度
                var _c = theme.edgeText, overflowMode = _c.overflowMode, lineHeight = _c.lineHeight, wrapPadding = _c.wrapPadding, textWidth = _c.textWidth;
                if (textWidth && overflowMode === 'autoWrap') {
                    autoStyle = __assign(__assign({}, commonAutoStyle), { width: textWidth, minWidth: textWidth, lineHeight: lineHeight, padding: wrapPadding });
                }
            }
            else if (textEditElement.BaseType === ElementType.NODE) {
                // 如果节点文案自动换行, 设置编辑框宽度
                var _d = theme.nodeText, overflowMode = _d.overflowMode, lineHeight = _d.lineHeight, wrapPadding = _d.wrapPadding, textWidth = _d.textWidth;
                var width = textEditElement.width, modelType = textEditElement.modelType, nodeTextWidth = textEditElement.textWidth;
                var finalTextWidth = nodeTextWidth || textWidth || width;
                // 文本节点没有默认宽高，只有在设置了textWidth之后才能进行自动换行
                if ((modelType !== ModelType.TEXT_NODE && overflowMode === 'autoWrap') ||
                    (modelType === ModelType.TEXT_NODE && textWidth)) {
                    autoStyle = __assign(__assign({}, commonAutoStyle), { width: finalTextWidth, minWidth: finalTextWidth, lineHeight: lineHeight, padding: wrapPadding });
                }
            }
            var _e = textEditElement.text, x = _e.x, y = _e.y;
            var _f = __read(transformModel.CanvasPointToHtmlPoint([x, y]), 2), left = _f[0], top_1 = _f[1];
            return {
                style: __assign(__assign({ left: left, top: top_1 }, autoStyle), inputText),
            };
        }
        return null;
    };
    TextEditTool.prototype.componentDidUpdate = function () {
        var graphModel = this.props.graphModel;
        if (this.ref.current) {
            this.ref.current.focus();
            this.placeCaretAtEnd(this.ref.current);
        }
        if (this.__prevText.id !== '') {
            var _a = this.__prevText, text = _a.text, id = _a.id;
            graphModel.updateText(id, text);
            graphModel.eventCenter.emit(EventType.TEXT_UPDATE, {
                data: __assign({}, this.__prevText),
            });
            this.__prevText.id = '';
            this.__prevText.text = '';
            this.__prevText.type = '';
        }
    };
    TextEditTool.prototype.placeCaretAtEnd = function (el) {
        if (window.getSelection !== undefined &&
            document.createRange !== undefined) {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel === null || sel === void 0 ? void 0 : sel.removeAllRanges();
            sel === null || sel === void 0 ? void 0 : sel.addRange(range);
        }
    };
    TextEditTool.prototype.render = function () {
        var _a;
        var textEditElement = this.props.graphModel.textEditElement;
        var style = this.state.style;
        return textEditElement ? (_jsx("div", { contentEditable: true, className: "lf-text-input", style: style, ref: this.ref, onKeyUp: this.keyupHandler, onKeyDown: this.keydownHandler, onKeyPress: this.keydownHandler, onInput: this.inputHandler, children: (_a = textEditElement.text) === null || _a === void 0 ? void 0 : _a.value }, textEditElement.id)) : null;
    };
    TextEditTool.toolName = 'text-edit-tool';
    TextEditTool = __decorate([
        observer
    ], TextEditTool);
    return TextEditTool;
}(Component));
export { TextEditTool };
export default TextEditTool;
