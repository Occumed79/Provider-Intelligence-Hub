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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEdgeModel = void 0;
var lodash_es_1 = require("lodash-es");
var mobx_1 = require("mobx");
var util_1 = require("../../util");
var constant_1 = require("../../constant");
var BaseEdgeModel = /** @class */ (function () {
    function BaseEdgeModel(data, graphModel) {
        var _a;
        this.BaseType = constant_1.ElementType.EDGE;
        // 数据属性
        this.id = '';
        this.type = '';
        this.sourceNodeId = '';
        this.targetNodeId = '';
        this.textMode = constant_1.TextMode.TEXT;
        this.text = {
            value: '',
            x: 0,
            y: 0,
            draggable: false,
            editable: true,
        };
        this.points = '';
        this.pointsList = [];
        // 状态属性
        this.virtual = false;
        this.isSelected = false;
        this.isHovered = false;
        this.isHitable = true; // 细粒度控制边是否对用户操作进行反应
        this.isHittable = true; // 细粒度控制边是否对用户操作进行反应
        this.draggable = true;
        this.visible = true;
        // 边特有属性，动画及调整点
        this.isAnimation = false;
        this.isShowAdjustPoint = false; // 是否显示边两端的调整点
        this.zIndex = 0;
        this.state = constant_1.ElementState.DEFAULT;
        this.modelType = constant_1.ModelType.EDGE;
        this.customTextPosition = false; // 是否自定义边文本位置
        this.style = {}; // 每条边自己的样式，动态修改
        // TODO: 每个边独立生成一个marker没必要
        // 箭头属性
        this.arrowConfig = {
            markerEnd: "url(#marker-end-".concat(this.id, ")"),
            markerStart: "url(#marker-start-".concat(this.id, ")"),
        };
        this.graphModel = graphModel;
        this.properties = (_a = data.properties) !== null && _a !== void 0 ? _a : {};
        this.initEdgeData(data);
        this.setAttributes();
    }
    /**
     * 初始化边数据
     * @overridable 支持重写
     * initNodeData和setAttributes的区别在于
     * initNodeData只在节点初始化的时候调用，用于初始化节点的所有属性。
     * setAttributes除了初始化调用外，还会在properties发生变化后调用。
     */
    BaseEdgeModel.prototype.initEdgeData = function (data) {
        var _this = this;
        if (!data.properties) {
            data.properties = {};
        }
        if (!data.id) {
            // 自定义边id > 全局定义边id > 内置
            var idGenerator = this.graphModel.idGenerator;
            var globalId = idGenerator && idGenerator(data.type);
            var nodeId = this.createId();
            data.id = nodeId || globalId || (0, util_1.createUuid)();
        }
        this.arrowConfig.markerEnd = "url(#marker-end-".concat(data.id, ")");
        this.arrowConfig.markerStart = "url(#marker-start-".concat(data.id, ")");
        var adjustEdgeStartAndEnd = this.graphModel.editConfigModel.adjustEdgeStartAndEnd;
        this.isShowAdjustPoint = adjustEdgeStartAndEnd;
        (0, lodash_es_1.assign)(this, (0, util_1.pickEdgeConfig)(data));
        var _a = this.graphModel, overlapMode = _a.overlapMode, eventCenter = _a.eventCenter;
        this.updateZIndexByOverlap(overlapMode, data.zIndex || (0, util_1.getZIndex)());
        // 设置边的 anchors，也就是边的两个端点
        // 端点依赖于 edgeData 的 sourceNode 和 targetNode
        this.setAnchors();
        // 边的拐点依赖于两个端点
        this.initPoints();
        // 文本位置依赖于边上的所有拐点
        this.formatText(data);
        eventCenter.on('overlap:change', function (data) {
            var newMode = data.overlapMode;
            _this.updateZIndexByOverlap(newMode, _this.zIndex || (0, util_1.getZIndex)());
        });
    };
    /**
     * 设置model属性
     * @overridable 支持重写
     * 每次properties发生变化会触发
     */
    BaseEdgeModel.prototype.setAttributes = function () { };
    BaseEdgeModel.prototype.createId = function () {
        return null;
    };
    /**
     * 自定义边样式
     *
     * @overridable 支持重写
     * @returns 自定义边样式
     */
    BaseEdgeModel.prototype.getEdgeStyle = function () {
        return __assign(__assign({}, this.graphModel.theme.baseEdge), this.style);
    };
    /**
     * 自定义边调整点样式
     *
     * @overridable 支持重写
     * 在isShowAdjustPoint为true时会显示调整点。
     */
    BaseEdgeModel.prototype.getAdjustPointStyle = function () {
        return __assign({}, this.graphModel.theme.edgeAdjust);
    };
    /**
     * 自定义边文本样式
     *
     * @overridable 支持重写
     */
    BaseEdgeModel.prototype.getTextStyle = function () {
        // 透传 edgeText
        var edgeText = this.graphModel.theme.edgeText;
        return (0, lodash_es_1.cloneDeep)(edgeText);
    };
    /**
     * 自定义边动画样式
     *
     * @overridable 支持重写
     * @example
     * getEdgeAnimationStyle() {
     *   const style = super.getEdgeAnimationStyle()
     *   style.stroke = 'blue'
     *   style.animationDuration = '30s'
     *   style.animationDirection = 'reverse'
     *   return style
     * }
     */
    BaseEdgeModel.prototype.getEdgeAnimationStyle = function () {
        var edgeAnimation = this.graphModel.theme.edgeAnimation;
        return (0, lodash_es_1.cloneDeep)(edgeAnimation);
    };
    /**
     * 自定义边箭头样式
     *
     * @overridable 支持重写
     * @example
     * getArrowStyle() {
     *   const style = super.getArrowStyle()
     *   style.stroke = 'green'
     *   return style
     * }
     */
    BaseEdgeModel.prototype.getArrowStyle = function () {
        var edgeStyle = this.getEdgeStyle();
        var edgeAnimationStyle = this.getEdgeAnimationStyle();
        var arrow = this.graphModel.theme.arrow;
        var stroke = this.isAnimation
            ? edgeAnimationStyle.stroke
            : edgeStyle.stroke;
        return __assign(__assign(__assign({}, edgeStyle), { fill: stroke, stroke: stroke }), arrow);
    };
    /**
     * 自定义边被选中时展示其范围的矩形框样式
     *
     * @overridable 支持重写
     * @example
     * // 隐藏outline
     * getOutlineStyle() {
     *   const style = super.getOutlineStyle()
     *   style.stroke = "none"
     *   style.hover.stroke = "none"
     *   return style
     * }
     */
    BaseEdgeModel.prototype.getOutlineStyle = function () {
        var graphModel = this.graphModel;
        var edgeOutline = graphModel.theme.edgeOutline;
        var attributes = __assign({}, edgeOutline);
        if (this.isHovered) {
            var hoverStyle = edgeOutline.hover || {};
            attributes = __assign(__assign({}, attributes), hoverStyle);
        }
        return (0, lodash_es_1.cloneDeep)(attributes);
    };
    /**
     * 重新自定义文本位置
     *
     * @overridable 支持重写
     */
    BaseEdgeModel.prototype.getTextPosition = function () {
        return {
            x: 0,
            y: 0,
        };
    };
    Object.defineProperty(BaseEdgeModel.prototype, "sourceNode", {
        /**
         * 边的前一个节点
         */
        get: function () {
            var _a, _b;
            return (_b = (_a = this.graphModel) === null || _a === void 0 ? void 0 : _a.nodesMap[this.sourceNodeId]) === null || _b === void 0 ? void 0 : _b.model;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseEdgeModel.prototype, "targetNode", {
        /**
         * 边的后一个节点
         */
        get: function () {
            var _a, _b;
            return (_b = (_a = this.graphModel) === null || _a === void 0 ? void 0 : _a.nodesMap[this.targetNodeId]) === null || _b === void 0 ? void 0 : _b.model;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseEdgeModel.prototype, "textPosition", {
        get: function () {
            return this.getTextPosition();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 内部方法，计算两个节点相连时的起点位置
     */
    BaseEdgeModel.prototype.getBeginAnchor = function (sourceNode, targetNode, sourceAnchorId) {
        // https://github.com/didi/LogicFlow/issues/1077
        // 可能拿到的sourceAnchors为空数组，因此position可能返回为undefined
        var position;
        var minDistance;
        var sourceAnchors = (0, util_1.getAnchors)(sourceNode);
        if (sourceAnchorId) {
            position = (0, lodash_es_1.find)(sourceAnchors, function (anchor) { return anchor.id === sourceAnchorId; });
            // 如果指定了起始锚点，且指定锚点是节点拥有的锚点时，就把该点设置为起点
            if (position) {
                return position;
            }
            console.warn("\u672A\u5728\u8282\u70B9\u4E0A\u627E\u5230\u6307\u5B9A\u7684\u8D77\u70B9\u951A\u70B9".concat(sourceAnchorId, "\uFF0C\u5DF2\u4F7F\u7528\u9ED8\u8BA4\u951A\u70B9\u4F5C\u4E3A\u8D77\u70B9"));
        }
        sourceAnchors.forEach(function (anchor) {
            var distance = (0, util_1.twoPointDistance)(anchor, targetNode);
            if (minDistance === undefined) {
                minDistance = distance;
                position = anchor;
            }
            else if (distance < minDistance) {
                minDistance = distance;
                position = anchor;
            }
        });
        return position;
    };
    /**
     * 内部方法，计算两个节点相连时的终点位置
     */
    BaseEdgeModel.prototype.getEndAnchor = function (targetNode, targetAnchorId) {
        var _this = this;
        // https://github.com/didi/LogicFlow/issues/1077
        // 可能拿到的targetAnchors为空数组，因此position可能返回为undefined
        var position;
        var minDistance;
        var targetAnchors = (0, util_1.getAnchors)(targetNode);
        if (targetAnchorId) {
            position = (0, lodash_es_1.find)(targetAnchors, function (anchor) { return anchor.id === targetAnchorId; });
            // 如果指定了终点锚点，且指定锚点是节点拥有的锚点时，就把该点设置为终点
            if (position) {
                return position;
            }
            console.warn("\u672A\u5728\u8282\u70B9\u4E0A\u627E\u5230\u6307\u5B9A\u7684\u7EC8\u70B9\u951A\u70B9".concat(targetAnchorId, "\uFF0C\u5DF2\u4F7F\u7528\u9ED8\u8BA4\u951A\u70B9\u4F5C\u4E3A\u7EC8\u70B9"));
        }
        targetAnchors.forEach(function (anchor) {
            if (!_this.startPoint)
                return; // 如果此时 this.startPoint 为 undefined，直接返回
            var distance = (0, util_1.twoPointDistance)(anchor, _this.startPoint);
            if (minDistance === undefined) {
                minDistance = distance;
                position = anchor;
            }
            else if (distance < minDistance) {
                minDistance = distance;
                position = anchor;
            }
        });
        return position;
    };
    /**
     * 获取当前边的properties
     */
    BaseEdgeModel.prototype.getProperties = function () {
        return (0, mobx_1.toJS)(this.properties);
    };
    /**
     * 获取被保存时返回的数据
     *
     * @overridable 支持重写
     */
    BaseEdgeModel.prototype.getData = function () {
        var properties = this.properties;
        if ((0, mobx_1.isObservable)(properties)) {
            properties = (0, mobx_1.toJS)(properties);
        }
        var data = {
            id: this.id,
            type: this.type,
            properties: properties,
            sourceNodeId: this.sourceNodeId,
            targetNodeId: this.targetNodeId,
            sourceAnchorId: this.sourceAnchorId,
            targetAnchorId: this.targetAnchorId,
            startPoint: (0, lodash_es_1.assign)({}, this.startPoint),
            endPoint: (0, lodash_es_1.assign)({}, this.endPoint),
        };
        // 因为默认模式和边在上模式下，对节点的zIndex要求不高（因为渲染的时候会按照模式对所有元素进行排序）
        // 所以只在递增模式和静态模式下设置zIndex
        if ([constant_1.OverlapMode.INCREASE, constant_1.OverlapMode.STATIC].includes(this.graphModel.overlapMode)) {
            data.zIndex = this.zIndex;
        }
        var _a = this.text, x = _a.x, y = _a.y, value = _a.value;
        if (value) {
            data.text = {
                x: x,
                y: y,
                value: value,
            };
        }
        return data;
    };
    /**
     * 获取边的数据
     *
     * @overridable 支持重写
     * 用于在历史记录时获取节点数据。
     * 在某些情况下，如果希望某个属性变化不引起history的变化，
     * 可以重写此方法。
     */
    BaseEdgeModel.prototype.getHistoryData = function () {
        return this.getData();
    };
    /**
     * 设置边的属性，会触发重新渲染
     * @param key 属性名
     * @param val 属性值
     */
    BaseEdgeModel.prototype.setProperty = function (key, val) {
        (0, mobx_1.set)(this.properties, key, (0, util_1.formatData)(val));
        this.setAttributes();
    };
    /**
     * 删除边的属性，会触发重新渲染
     * @param key 属性名
     */
    BaseEdgeModel.prototype.deleteProperty = function (key) {
        delete this.properties[key];
        this.setAttributes();
    };
    /**
     * 设置边的属性，会触发重新渲染
     * @param properties 要更新的 properties，会做合并
     */
    BaseEdgeModel.prototype.setProperties = function (properties) {
        this.properties = __assign(__assign({}, (0, mobx_1.toJS)(this.properties)), (0, util_1.formatData)(properties));
        this.setAttributes();
    };
    /**
     * 修改边的id
     */
    BaseEdgeModel.prototype.changeEdgeId = function (id) {
        var _a = this.arrowConfig, markerEnd = _a.markerEnd, markerStart = _a.markerStart;
        if (markerStart && markerStart === "url(#marker-start-".concat(this.id, ")")) {
            this.arrowConfig.markerStart = "url(#marker-start-".concat(id, ")");
        }
        if (markerEnd && markerEnd === "url(#marker-end-".concat(this.id, ")")) {
            this.arrowConfig.markerEnd = "url(#marker-end-".concat(id, ")");
        }
        this.id = id;
    };
    /**
     * 设置边样式，用于插件开发时跳过自定义边的渲染。大多数情况下，不需要使用此方法。
     * 如果需要设置边的样式，请使用 getEdgeStyle 方法自定义边样式。
     */
    BaseEdgeModel.prototype.setStyle = function (key, val) {
        var _a;
        this.style = __assign(__assign({}, this.style), (_a = {}, _a[key] = (0, util_1.formatData)(val), _a));
    };
    /**
     * 设置边样式，用于插件开发时跳过自定义边的渲染。大多数情况下，不需要使用此方法。
     * 如果需要设置边的样式，请使用 getEdgeStyle 方法自定义边样式。
     */
    BaseEdgeModel.prototype.setStyles = function (styles) {
        this.style = __assign(__assign({}, this.style), (0, util_1.formatData)(styles));
    };
    /**
     * 设置边样式，用于插件开发时跳过自定义边的渲染。大多数情况下，不需要使用此方法。
     * 如果需要设置边的样式，请使用 getEdgeStyle 方法自定义边样式。
     */
    BaseEdgeModel.prototype.updateStyles = function (styles) {
        this.style = __assign({}, (0, util_1.formatData)(styles));
    };
    /**
     * 设置当前元素的文本模式
     * @param mode
     */
    BaseEdgeModel.prototype.setTextMode = function (mode) {
        this.textMode = mode;
    };
    /**
     * 内部方法，处理初始化文本格式
     */
    BaseEdgeModel.prototype.formatText = function (data) {
        var _a, _b, _c;
        var _d = this.graphModel.editConfigModel, edgeTextDraggable = _d.edgeTextDraggable, edgeTextEdit = _d.edgeTextEdit;
        var _e = this.textPosition, x = _e.x, y = _e.y;
        var text = data.text;
        var textConfig = {
            value: '',
            x: x,
            y: y,
            draggable: edgeTextDraggable,
            editable: edgeTextEdit,
        };
        if (text) {
            if (typeof text === 'string') {
                textConfig = __assign(__assign({}, textConfig), { value: text });
            }
            else {
                textConfig = __assign(__assign({}, textConfig), { x: (_a = text.x) !== null && _a !== void 0 ? _a : x, y: (_b = text.y) !== null && _b !== void 0 ? _b : y, value: (_c = text.value) !== null && _c !== void 0 ? _c : '' });
                if (!(0, lodash_es_1.isUndefined)(text.draggable)) {
                    textConfig.draggable = text.draggable;
                }
                if (!(0, lodash_es_1.isUndefined)(text.editable)) {
                    textConfig.editable = text.editable;
                }
            }
        }
        this.text = textConfig;
    };
    /**
     * 重置文本位置
     */
    BaseEdgeModel.prototype.resetTextPosition = function () {
        var _a = this.textPosition, x = _a.x, y = _a.y;
        this.text.x = x;
        this.text.y = y;
    };
    /**
     * 移动边上的文本
     */
    BaseEdgeModel.prototype.moveText = function (deltaX, deltaY) {
        var _a = this.text, x = _a.x, y = _a.y, value = _a.value, draggable = _a.draggable, editable = _a.editable;
        this.text = {
            value: value,
            editable: editable,
            draggable: draggable,
            x: x + deltaX,
            y: y + deltaY,
        };
    };
    /**
     * 设置文本位置和值
     */
    BaseEdgeModel.prototype.setText = function (textConfig) {
        if (textConfig) {
            (0, lodash_es_1.assign)(this.text, textConfig);
        }
    };
    /**
     * 更新文本的值
     */
    BaseEdgeModel.prototype.updateText = function (value) {
        this.text = __assign(__assign({}, (0, mobx_1.toJS)(this.text)), { value: value });
    };
    /**
     * 内部方法，计算边的起点和终点和其对于的锚点Id
     */
    BaseEdgeModel.prototype.setAnchors = function () {
        if (!this.sourceAnchorId || !this.startPoint) {
            var anchor = this.getBeginAnchor(this.sourceNode, this.targetNode, this.sourceAnchorId);
            if (!anchor) {
                // https://github.com/didi/LogicFlow/issues/1077
                // 当用户自定义getDefaultAnchor(){return []}时，表示：不显示锚点，也不允许其他节点连接到此节点
                // 此时拿到的anchor=undefined，下面会直接报错
                throw new Error('无法获取beginAnchor，请检查anchors相关逻辑，anchors不能为空');
            }
            if (!this.startPoint) {
                this.startPoint = {
                    x: anchor.x,
                    y: anchor.y,
                };
            }
            if (!this.sourceAnchorId) {
                this.sourceAnchorId = anchor.id;
            }
        }
        if (!this.targetAnchorId || !this.endPoint) {
            var anchor = this.getEndAnchor(this.targetNode, this.targetAnchorId);
            if (!anchor) {
                // https://github.com/didi/LogicFlow/issues/1077
                // 当用户自定义getDefaultAnchor(){return []}时，表示：不显示锚点，也不允许其他节点连接到此节点
                // 此时拿到的anchor=undefined，下面会直接报错
                throw new Error('无法获取endAnchor，请检查anchors相关逻辑，anchors不能为空');
            }
            if (!this.endPoint) {
                this.endPoint = {
                    x: anchor.x,
                    y: anchor.y,
                };
            }
            if (!this.targetAnchorId) {
                this.targetAnchorId = anchor.id;
            }
        }
    };
    BaseEdgeModel.prototype.setSelected = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isSelected = flag;
    };
    BaseEdgeModel.prototype.setHovered = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isHovered = flag;
    };
    BaseEdgeModel.prototype.setHitable = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isHitable = flag;
    };
    BaseEdgeModel.prototype.setHittable = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isHittable = flag;
    };
    BaseEdgeModel.prototype.openEdgeAnimation = function () {
        this.isAnimation = true;
    };
    BaseEdgeModel.prototype.closeEdgeAnimation = function () {
        this.isAnimation = false;
    };
    BaseEdgeModel.prototype.setElementState = function (state, additionStateData) {
        this.state = state;
        this.additionStateData = additionStateData;
    };
    BaseEdgeModel.prototype.updateStartPoint = function (anchor) {
        this.startPoint = anchor;
    };
    BaseEdgeModel.prototype.moveStartPoint = function (deltaX, deltaY) {
        if (this.startPoint) {
            this.startPoint.x += deltaX;
            this.startPoint.y += deltaY;
        }
    };
    BaseEdgeModel.prototype.updateEndPoint = function (anchor) {
        this.endPoint = anchor;
    };
    BaseEdgeModel.prototype.moveEndPoint = function (deltaX, deltaY) {
        if (this.endPoint) {
            this.endPoint.x += deltaX;
            this.endPoint.y += deltaY;
        }
    };
    BaseEdgeModel.prototype.setZIndex = function (zIndex) {
        if (zIndex === void 0) { zIndex = 0; }
        this.zIndex = zIndex;
    };
    BaseEdgeModel.prototype.initPoints = function () { };
    BaseEdgeModel.prototype.updateAttributes = function (attributes) {
        (0, lodash_es_1.assign)(this, attributes);
    };
    // 获取边调整的起点
    BaseEdgeModel.prototype.getAdjustStart = function () {
        return this.startPoint;
    };
    // 获取边调整的终点
    BaseEdgeModel.prototype.getAdjustEnd = function () {
        return this.endPoint;
    };
    // 起终点拖拽调整过程中，进行直线路径更新
    BaseEdgeModel.prototype.updateAfterAdjustStartAndEnd = function (_a) {
        var startPoint = _a.startPoint, endPoint = _a.endPoint;
        this.updateStartPoint({ x: startPoint.x, y: startPoint.y });
        this.updateEndPoint({ x: endPoint.x, y: endPoint.y });
    };
    // 堆叠模式变化时，更新zIndex
    BaseEdgeModel.prototype.updateZIndexByOverlap = function (overlapMode, defaultZIndex) {
        switch (overlapMode) {
            case constant_1.OverlapMode.DEFAULT:
                this.zIndex = 0;
                break;
            case constant_1.OverlapMode.EDGE_TOP:
                this.zIndex = 1;
                break;
            case constant_1.OverlapMode.INCREASE:
                this.zIndex = defaultZIndex;
                break;
            default:
                break;
        }
    };
    BaseEdgeModel.BaseType = constant_1.ElementType.EDGE;
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "type", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "sourceNodeId", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "targetNodeId", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "startPoint", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "endPoint", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "textMode", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "text", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "properties", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "points", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "pointsList", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "isSelected", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "isHovered", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "isHitable", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "isHittable", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "draggable", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "visible", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "isAnimation", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "isShowAdjustPoint", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "zIndex", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "state", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "style", void 0);
    __decorate([
        mobx_1.observable
    ], BaseEdgeModel.prototype, "arrowConfig", void 0);
    __decorate([
        mobx_1.computed
    ], BaseEdgeModel.prototype, "sourceNode", null);
    __decorate([
        mobx_1.computed
    ], BaseEdgeModel.prototype, "targetNode", null);
    __decorate([
        mobx_1.computed
    ], BaseEdgeModel.prototype, "textPosition", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setProperty", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "deleteProperty", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setProperties", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "changeEdgeId", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setStyle", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setStyles", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "updateStyles", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setTextMode", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "formatText", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "resetTextPosition", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "moveText", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setText", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "updateText", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setAnchors", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setSelected", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setHovered", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setHitable", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setHittable", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "openEdgeAnimation", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "closeEdgeAnimation", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setElementState", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "updateStartPoint", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "moveStartPoint", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "updateEndPoint", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "moveEndPoint", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "setZIndex", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "initPoints", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "updateAttributes", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "getAdjustStart", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "getAdjustEnd", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "updateAfterAdjustStartAndEnd", null);
    __decorate([
        mobx_1.action
    ], BaseEdgeModel.prototype, "updateZIndexByOverlap", null);
    return BaseEdgeModel;
}());
exports.BaseEdgeModel = BaseEdgeModel;
exports.default = BaseEdgeModel;
