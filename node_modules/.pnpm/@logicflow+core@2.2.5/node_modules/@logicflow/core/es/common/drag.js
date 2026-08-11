import { noop } from 'lodash-es';
import { EventType } from '../constant';
// TODO：这种方式在同构项目中，会报错，该如何解决（是否要求用户控制在浏览器环境时才初始化）
// const DOC: any = window?.document
var LEFT_MOUSE_BUTTON_CODE = 0;
/**
 * 支持拖拽时按步长进行移动
 * REMIND：在绘制的过程中因为放大缩小，移动的真实 step 是变化的
 */
var StepperDrag = /** @class */ (function () {
    function StepperDrag(_a) {
        var _b = _a.onDragStart, onDragStart = _b === void 0 ? noop : _b, _c = _a.onDragging, onDragging = _c === void 0 ? noop : _c, _d = _a.onDragEnd, onDragEnd = _d === void 0 ? noop : _d, _e = _a.step, step = _e === void 0 ? 1 : _e, _f = _a.eventType, eventType = _f === void 0 ? '' : _f, _g = _a.isStopPropagation, isStopPropagation = _g === void 0 ? true : _g, eventCenter = _a.eventCenter, model = _a.model, data = _a.data;
        var _this = this;
        // 运行时
        this.isDragging = false;
        this.isStartDrag = false;
        this.startX = 0;
        this.startY = 0;
        this.totalDeltaX = 0;
        this.totalDeltaY = 0;
        this.handleMouseMove = function (e) {
            var _a, _b;
            if (_this.isStopPropagation)
                e.stopPropagation();
            if (!_this.isStartDrag)
                return;
            _this.totalDeltaX += e.clientX - _this.startX;
            _this.totalDeltaY += e.clientY - _this.startY;
            _this.startX = e.clientX;
            _this.startY = e.clientY;
            if (_this.step <= 1 ||
                Math.abs(_this.totalDeltaX) > _this.step ||
                Math.abs(_this.totalDeltaY) > _this.step) {
                var remainderX = _this.totalDeltaX % _this.step;
                var remainderY = _this.totalDeltaY % _this.step;
                var deltaX_1 = _this.totalDeltaX - remainderX;
                var deltaY_1 = _this.totalDeltaY - remainderY;
                _this.totalDeltaX = remainderX;
                _this.totalDeltaY = remainderY;
                var elementData_1 = (_a = _this.model) === null || _a === void 0 ? void 0 : _a.getData();
                // REMIND: 为了区分点击和拖动，在鼠标没有拖动时，不触发 dragstart。
                if (!_this.isDragging) {
                    if (_this.eventType) {
                        (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(EventType["".concat(_this.eventType, "_DRAGSTART")], {
                            e: e,
                            data: _this.data || elementData_1,
                        });
                    }
                    _this.onDragStart({ event: e });
                }
                _this.isDragging = true;
                // REMIND: 为了让 dragstart 和 drag 不在同一个事件循环中，将 drag 事件放在下一个任务队列中。
                // TODO: 测试用例是否可覆盖？？？
                Promise.resolve().then(function () {
                    var _a, _b;
                    _this.onDragging({ deltaX: deltaX_1, deltaY: deltaY_1, event: e });
                    if (_this.eventType) {
                        (_a = _this.eventCenter) === null || _a === void 0 ? void 0 : _a.emit(EventType["".concat(_this.eventType, "_MOUSEMOVE")], {
                            e: e,
                            data: _this.data || elementData_1,
                        });
                        (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(EventType["".concat(_this.eventType, "_DRAG")], {
                            e: e,
                            data: _this.data || elementData_1,
                        });
                    }
                });
            }
        };
        this.handleMouseUp = function (e) {
            var DOC = window === null || window === void 0 ? void 0 : window.document;
            _this.isStartDrag = false;
            if (_this.isStopPropagation)
                e.stopPropagation();
            // fix: issue#568, 如果 onDragging 在下一个时间循环中触发，而 drop 在当前事件循环，会出现问题
            Promise.resolve().then(function () {
                var _a, _b, _c;
                DOC === null || DOC === void 0 ? void 0 : DOC.removeEventListener('mousemove', _this.handleMouseMove, true);
                DOC === null || DOC === void 0 ? void 0 : DOC.removeEventListener('mouseup', _this.handleMouseUp, true);
                var elementData = (_a = _this.model) === null || _a === void 0 ? void 0 : _a.getData();
                if (_this.eventType) {
                    (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(EventType["".concat(_this.eventType, "_MOUSEUP")], {
                        e: e,
                        data: _this.data || elementData,
                    });
                }
                if (!_this.isDragging)
                    return;
                _this.isDragging = false;
                _this.onDragEnd({ event: e });
                if (_this.eventType) {
                    (_c = _this.eventCenter) === null || _c === void 0 ? void 0 : _c.emit(EventType["".concat(_this.eventType, "_DROP")], {
                        e: e,
                        data: _this.data || elementData,
                    });
                }
            });
        };
        this.handleMouseDown = function (e) {
            var _a, _b;
            var DOC = window === null || window === void 0 ? void 0 : window.document;
            // issue: LogicFlow交流群-3群 8.10 号抛出的事件相关的问题，是否是这引起的？？？
            if (e.button !== LEFT_MOUSE_BUTTON_CODE)
                return;
            if (_this.isStopPropagation)
                e.stopPropagation();
            _this.isStartDrag = true;
            _this.startX = e.clientX;
            _this.startY = e.clientY;
            DOC === null || DOC === void 0 ? void 0 : DOC.addEventListener('mousemove', _this.handleMouseMove, true);
            DOC === null || DOC === void 0 ? void 0 : DOC.addEventListener('mouseup', _this.handleMouseUp, true);
            var elementData = (_a = _this.model) === null || _a === void 0 ? void 0 : _a.getData();
            if (_this.eventType) {
                (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(EventType["".concat(_this.eventType, "_MOUSEDOWN")], {
                    e: e,
                    data: _this.data || elementData,
                });
            }
            _this.startTime = new Date().getTime();
        };
        this.cancelDrag = function () {
            var DOC = window === null || window === void 0 ? void 0 : window.document;
            DOC === null || DOC === void 0 ? void 0 : DOC.removeEventListener('mousemove', _this.handleMouseMove, true);
            DOC === null || DOC === void 0 ? void 0 : DOC.removeEventListener('mouseup', _this.handleMouseUp, true);
            _this.onDragEnd({ event: null });
            _this.isDragging = false;
        };
        this.onDragStart = onDragStart;
        this.onDragging = onDragging;
        this.onDragEnd = onDragEnd;
        this.step = step;
        this.eventType = eventType;
        this.isStopPropagation = isStopPropagation;
        this.eventCenter = eventCenter;
        this.model = model;
        this.data = data;
    }
    StepperDrag.prototype.setStep = function (step) {
        this.step = step;
    };
    return StepperDrag;
}());
export { StepperDrag };
export default StepperDrag;
