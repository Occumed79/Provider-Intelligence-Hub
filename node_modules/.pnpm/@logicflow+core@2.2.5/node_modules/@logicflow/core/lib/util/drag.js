"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepDrag = void 0;
var lodash_es_1 = require("lodash-es");
var constant_1 = require("../constant");
// TODO：这种方式在同构项目中，会报错，该如何解决（是否要求用户控制在浏览器环境时才初始化）
// const DOC: any = window?.document
var LEFT_MOUSE_BUTTON_CODE = 0;
// 支持拖拽的时候，按照指定step进行。
// 因为在绘制的过程中因为放大缩小，移动的真实的step则是变化的。
var StepDrag = /** @class */ (function () {
    function StepDrag(_a) {
        var _b = _a.onDragStart, onDragStart = _b === void 0 ? lodash_es_1.noop : _b, _c = _a.onDragging, onDragging = _c === void 0 ? lodash_es_1.noop : _c, _d = _a.onDragEnd, onDragEnd = _d === void 0 ? lodash_es_1.noop : _d, _e = _a.eventType, eventType = _e === void 0 ? '' : _e, eventCenter = _a.eventCenter, _f = _a.step, step = _f === void 0 ? 1 : _f, _g = _a.isStopPropagation, isStopPropagation = _g === void 0 ? true : _g, model = _a.model, data = _a.data;
        var _this = this;
        // 运行时
        this.isDragging = false;
        this.isStartDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.sumDeltaX = 0;
        this.sumDeltaY = 0;
        this.handleMouseDown = function (e) {
            var _a, _b;
            var DOC = window === null || window === void 0 ? void 0 : window.document;
            if (e.button !== LEFT_MOUSE_BUTTON_CODE)
                return;
            if (_this.isStopPropagation)
                e.stopPropagation();
            _this.isStartDragging = true;
            _this.startX = e.clientX;
            _this.startY = e.clientY;
            DOC.addEventListener('pointermove', _this.handleMouseMove, false);
            DOC.addEventListener('pointerup', _this.handleMouseUp, false);
            var elementData = (_a = _this.model) === null || _a === void 0 ? void 0 : _a.getData();
            (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(constant_1.EventType["".concat(_this.eventType, "_MOUSEDOWN")], {
                e: e,
                data: _this.data || elementData,
            });
            _this.startTime = new Date().getTime();
        };
        this.handleMouseMove = function (e) {
            var _a, _b;
            if (_this.isStopPropagation)
                e.stopPropagation();
            e.preventDefault();
            if (!_this.isStartDragging)
                return;
            _this.sumDeltaX += e.clientX - _this.startX;
            _this.sumDeltaY += e.clientY - _this.startY;
            _this.startX = e.clientX;
            _this.startY = e.clientY;
            if (_this.step <= 1 ||
                Math.abs(_this.sumDeltaX) > _this.step ||
                Math.abs(_this.sumDeltaY) > _this.step) {
                var remainderX = _this.sumDeltaX % _this.step;
                var remainderY = _this.sumDeltaY % _this.step;
                var deltaX_1 = _this.sumDeltaX - remainderX;
                var deltaY_1 = _this.sumDeltaY - remainderY;
                _this.sumDeltaX = remainderX;
                _this.sumDeltaY = remainderY;
                var elementData_1 = (_a = _this.model) === null || _a === void 0 ? void 0 : _a.getData();
                /**
                 * 为了区分点击和拖动，在鼠标没有拖动时，不触发dragstart。
                 */
                if (!_this.isDragging) {
                    (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(constant_1.EventType["".concat(_this.eventType, "_DRAGSTART")], {
                        e: e,
                        data: _this.data || elementData_1,
                    });
                    _this.onDragStart({ event: e });
                }
                _this.isDragging = true;
                // 为了让dragstart和drag不在同一个事件循环中，使drag事件放到下一个消息队列中。
                // TODO: 放到下一个消息队列中是否会有延迟，比如
                // 限制某个元素的拖拽范围，如果在dragstart中设置了拖拽范围，那么在drag中就会有延迟。
                Promise.resolve().then(function () {
                    var _a, _b;
                    _this.onDragging({
                        deltaX: deltaX_1,
                        deltaY: deltaY_1,
                        event: e,
                    });
                    (_a = _this.eventCenter) === null || _a === void 0 ? void 0 : _a.emit(constant_1.EventType["".concat(_this.eventType, "_MOUSEMOVE")], {
                        deltaX: deltaX_1,
                        deltaY: deltaY_1,
                        e: e,
                        data: _this.data || elementData_1,
                    });
                    (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(constant_1.EventType["".concat(_this.eventType, "_DRAG")], {
                        e: e,
                        data: _this.data || elementData_1,
                    });
                });
            }
        };
        this.handleMouseUp = function (e) {
            var DOC = window.document;
            _this.isStartDragging = false;
            if (_this.isStopPropagation)
                e.stopPropagation();
            var target = e.target;
            if (target && typeof target.releasePointerCapture === 'function') {
                target.releasePointerCapture(e.pointerId);
            }
            // fix #568: 如果onDragging在下一个事件循环中触发，而drop在当前事件循环，会出现问题。
            Promise.resolve().then(function () {
                var _a, _b, _c;
                DOC.removeEventListener('pointermove', _this.handleMouseMove, false);
                DOC.removeEventListener('pointerup', _this.handleMouseUp, false);
                var elementData = (_a = _this.model) === null || _a === void 0 ? void 0 : _a.getData();
                (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(constant_1.EventType["".concat(_this.eventType, "_MOUSEUP")], {
                    e: e,
                    data: _this.data || elementData,
                });
                if (!_this.isDragging)
                    return;
                _this.isDragging = false;
                _this.onDragEnd({ event: e });
                (_c = _this.eventCenter) === null || _c === void 0 ? void 0 : _c.emit(constant_1.EventType["".concat(_this.eventType, "_DROP")], {
                    e: e,
                    data: _this.data || elementData,
                });
            });
        };
        this.cancelDrag = function () {
            var DOC = window === null || window === void 0 ? void 0 : window.document;
            DOC.removeEventListener('pointermove', _this.handleMouseMove, false);
            DOC.removeEventListener('pointerup', _this.handleMouseUp, false);
            _this.onDragEnd({ event: undefined });
            _this.isDragging = false;
        };
        this.destroy = function () {
            if (_this.isStartDragging) {
                // https://github.com/didi/LogicFlow/issues/1934
                // https://github.com/didi/LogicFlow/issues/1926
                // cancelDrag()->onDragEnd()->updateEdgePointByAnchors()触发线的重新计算
                // 我们的本意是为了防止mousemove和mouseup没有及时被移除
                // 因此这里增加if(this.isStartDragging)的判断，isStartDragging=true代表没有触发handleMouseUp()，此时监听还没被移除
                // 在拖拽情况下(isStartDragging=true)，此时注册了监听，在组件突然销毁时，强制触发cancelDrag进行监听事件的移除
                _this.cancelDrag();
            }
        };
        this.onDragStart = onDragStart;
        this.onDragging = onDragging;
        this.onDragEnd = onDragEnd;
        this.step = step;
        this.isStopPropagation = isStopPropagation;
        this.eventType = eventType;
        this.eventCenter = eventCenter;
        this.model = model;
        this.data = data;
    }
    StepDrag.prototype.setStep = function (step) {
        this.step = step;
    };
    StepDrag.prototype.setModel = function (model) {
        this.model = model;
    };
    return StepDrag;
}());
exports.StepDrag = StepDrag;
