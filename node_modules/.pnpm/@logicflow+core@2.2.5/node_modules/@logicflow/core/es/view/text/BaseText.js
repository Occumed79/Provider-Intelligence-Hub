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
import { jsx as _jsx } from "preact/jsx-runtime";
import classNames from 'classnames';
import { Component } from 'preact/compat';
import { ElementState, EventType } from '../../constant';
import { Text } from '../shape';
import { StepDrag } from '../../util';
var BaseText = /** @class */ (function (_super) {
    __extends(BaseText, _super);
    function BaseText(props) {
        var _this = _super.call(this) || this;
        _this.mouseDownHandler = function (e) {
            var _a = _this.props, draggable = _a.draggable, model = _a.model, graphModel = _a.graphModel;
            var nodeTextDraggable = graphModel.editConfigModel.nodeTextDraggable;
            if (draggable !== null && draggable !== void 0 ? draggable : nodeTextDraggable) {
                e.stopPropagation();
                _this.stepperDrag.model = model;
                _this.stepperDrag.handleMouseDown(e);
            }
        };
        _this.onDragging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            var _b = _this.props, model = _b.model, transformModel = _b.graphModel.transformModel;
            if (deltaX || deltaY) {
                var _c = __read(transformModel.fixDeltaXY(deltaX, deltaY), 2), curDeltaX = _c[0], curDeltaY = _c[1];
                model.moveText(curDeltaX, curDeltaY);
            }
        };
        _this.dbClickHandler = function () {
            // 静默模式下，双击不更改状态，不可编辑
            var _a = _this.props, editable = _a.editable, eventCenter = _a.graphModel.eventCenter, model = _a.model;
            if (editable) {
                model.setElementState(ElementState.TEXT_EDIT);
            }
            eventCenter.emit(EventType.TEXT_DBCLICK, {
                data: model.text,
                model: model,
            });
        };
        var draggable = props.draggable;
        // TODO: 确认为什么不在 new 的时候传入 model，而在下面使用的时候赋值
        _this.stepperDrag = new StepDrag({
            onDragging: _this.onDragging,
            step: 1,
            // model,
            eventType: 'TEXT',
            isStopPropagation: draggable,
        });
        return _this;
    }
    BaseText.prototype.getShape = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var editConfigModel = graphModel.editConfigModel;
        var _b = model.text, value = _b.value, x = _b.x, y = _b.y, editable = _b.editable, draggable = _b.draggable;
        var attr = {
            x: x,
            y: y,
            className: '',
            value: value,
        };
        // DONE: 代码优化，看是否可以引入 classnames
        // TODO: 确认下面逻辑是否正确，确认正确后删除下面注释
        // if (editable) {
        //   attr.className = 'lf-element-text';
        // } else if (draggable || editConfigModel.nodeTextDraggable) {
        //   attr.className = 'lf-text-draggable';
        // } else {
        //   attr.className = 'lf-text-disabled';
        // }
        var style = model.getTextStyle();
        var isDraggable = editConfigModel.nodeTextDraggable || draggable;
        return (_jsx(Text, __assign({}, attr, style, { className: classNames({
                'lf-element-text': editable,
                'lf-text-draggable': !editable && isDraggable,
                'lf-text-disabled': !editable && !isDraggable,
            }), model: model })));
    };
    BaseText.prototype.render = function () {
        var text = this.props.model.text;
        if (text) {
            return (_jsx("g", { onPointerDown: this.mouseDownHandler, onDblClick: this.dbClickHandler, children: this.getShape() }));
        }
    };
    return BaseText;
}(Component));
export { BaseText };
export default BaseText;
