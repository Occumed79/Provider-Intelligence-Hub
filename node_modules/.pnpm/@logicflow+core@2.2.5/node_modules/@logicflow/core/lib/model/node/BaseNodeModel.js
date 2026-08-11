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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
exports.BaseNodeModel = void 0;
var mobx_1 = require("mobx");
var lodash_es_1 = require("lodash-es");
var util_1 = require("../../util");
var constant_1 = require("../../constant");
var BaseNodeModel = /** @class */ (function () {
    function BaseNodeModel(data, graphModel) {
        var _a;
        this.BaseType = constant_1.ElementType.NODE;
        // 数据属性
        this.id = '';
        this.type = '';
        this.x = 0;
        this.y = 0;
        this.textMode = constant_1.TextMode.TEXT;
        this.text = {
            value: '',
            x: 0,
            y: 0,
            draggable: false,
            editable: true,
        };
        // 形状属性
        this._width = 100;
        this._height = 80;
        this.minWidth = 30;
        this.minHeight = 30;
        this.maxWidth = 2000;
        this.maxHeight = 2000;
        // 根据与 (x, y) 的偏移量计算 anchors 的坐标
        this.anchorsOffset = [];
        // 状态属性
        this.virtual = false;
        this.isSelected = false;
        this.isHovered = false;
        this.isShowAnchor = false;
        this.isDragging = false;
        this.isHitable = true; // TODO: 兼容拼写错误的情况 Remove
        this.isHittable = true; // 细粒度控制节点是否对用户操作进行反应
        this.draggable = true;
        this.visible = true;
        this.rotatable = true; // 节点可旋转
        this.resizable = true; // 节点可缩放
        this.zIndex = 1;
        this.state = constant_1.ElementState.DEFAULT;
        this.autoToFront = true; // 节点选中时是否自动置顶，默认为true.
        this.style = {}; // 每个节点自己的样式，动态修改
        this._rotate = 0;
        this.modelType = constant_1.ModelType.NODE;
        this.additionStateData = {};
        // 节点连入、练出、移动等规则
        this.targetRules = [];
        this.sourceRules = [];
        this.moveRules = []; // 节点移动之前的hook
        this.resizeRules = []; // 节点resize之前的hook
        this.hasSetTargetRules = false; // 用来限制rules的重复值
        this.hasSetSourceRules = false; // 用来限制rules的重复值
        this.graphModel = graphModel;
        this.properties = (_a = data.properties) !== null && _a !== void 0 ? _a : {};
        this.initNodeData(data);
        this.setAttributes();
    }
    Object.defineProperty(BaseNodeModel.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            this._width = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseNodeModel.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            this._height = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseNodeModel.prototype, "rotate", {
        get: function () {
            return this._rotate;
        },
        set: function (value) {
            this._rotate = value;
            var _a = this, _b = _a.x, x = _b === void 0 ? 0 : _b, _c = _a.y, y = _c === void 0 ? 0 : _c;
            this.transform = new util_1.TranslateMatrix(-x, -y)
                .rotate(value)
                .translate(x, y)
                .toString();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseNodeModel.prototype, "incoming", {
        /**
         * 获取进入当前节点的边和节点
         */
        get: function () {
            return {
                nodes: this.graphModel.getNodeIncomingNode(this.id),
                edges: this.graphModel.getNodeIncomingEdge(this.id),
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseNodeModel.prototype, "outgoing", {
        /*
         * 获取离开当前节点的边和节点
         */
        get: function () {
            return {
                nodes: this.graphModel.getNodeOutgoingNode(this.id),
                edges: this.graphModel.getNodeOutgoingEdge(this.id),
            };
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @overridable 可以重写
     * 初始化节点数据
     * initNodeData 和 setAttributes 的区别在于
     * initNodeData 只在节点初始化的时候调用，用于初始化节点的所有属性。
     * setAttributes 除了初始化调用外，还会在 properties 发生变化了调用。
     */
    BaseNodeModel.prototype.initNodeData = function (data) {
        var _this = this;
        if (!data.properties) {
            data.properties = {};
        }
        if (!data.id) {
            // 自定义节点id > 全局定义id > 内置
            var idGenerator = this.graphModel.idGenerator;
            var globalId = idGenerator && idGenerator(data.type);
            var nodeId = this.createId();
            data.id = nodeId || globalId || (0, util_1.createUuid)();
        }
        this.formatText(data);
        // 在下面又将 NodeConfig 中的数据赋值给了 this，应该会触发 setAttributes，确认是否符合预期
        // TODO: 确认 constructor 中赋值 properties 是否必要，此处将 NodeConfig 中所有属性赋值给 this，包括 rotate、rotatable，resizable 等
        (0, lodash_es_1.assign)(this, (0, util_1.pickNodeConfig)(data));
        var _a = this.graphModel, overlapMode = _a.overlapMode, eventCenter = _a.eventCenter;
        this.updateZIndexByOverlap(overlapMode, data.zIndex || (0, util_1.getZIndex)());
        eventCenter.on('overlap:change', function (data) {
            var newMode = data.overlapMode;
            _this.updateZIndexByOverlap(newMode, _this.zIndex || (0, util_1.getZIndex)());
        });
    };
    /**
     * 设置model属性，每次properties发生变化会触发
     * 例如设置节点的宽度
     * @example
     *
     * setAttributes () {
     *   this.width = 300
     *   this.height = 200
     * }
     *
     * @overridable 支持重写
     */
    BaseNodeModel.prototype.setAttributes = function () { };
    /**
     * @overridable 支持重写，自定义此类型节点默认生成方式
     * @returns string | null
     */
    BaseNodeModel.prototype.createId = function () {
        return null;
    };
    /**
     * 设置当前元素的文本模式
     * @param mode
     */
    BaseNodeModel.prototype.setTextMode = function (mode) {
        this.textMode = mode;
    };
    /**
     * 始化文本属性
     */
    BaseNodeModel.prototype.formatText = function (data) {
        var _a, _b, _c;
        var _d = this.graphModel.editConfigModel, nodeTextDraggable = _d.nodeTextDraggable, nodeTextEdit = _d.nodeTextEdit;
        var x = data.x, y = data.y, text = data.text;
        var textConfig = {
            value: '',
            x: x,
            y: y,
            draggable: nodeTextDraggable,
            editable: nodeTextEdit,
        };
        if (text) {
            if (typeof text === 'string') {
                textConfig.value = text;
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
        data.text = textConfig;
    };
    /**
     * @overridable 支持重写
     * 计算节点 resize 时
     */
    BaseNodeModel.prototype.resize = function (resizeInfo) {
        var width = resizeInfo.width, height = resizeInfo.height, deltaX = resizeInfo.deltaX, deltaY = resizeInfo.deltaY;
        var isAllowResize = this.isAllowResizeNode(deltaX, deltaY, width, height);
        if (!isAllowResize) {
            return this.getData();
        }
        // 移动节点以及文本内容
        this.move(deltaX / 2, deltaY / 2);
        this.width = width;
        this.height = height;
        this.setProperties({
            width: width,
            height: height,
        });
        return this.getData();
    };
    // TODO: 等比例缩放
    BaseNodeModel.prototype.proportionalResize = function () { };
    /**
     * 获取被保存时返回的数据
     * @overridable 支持重写
     */
    BaseNodeModel.prototype.getData = function () {
        var _a = this.text, x = _a.x, y = _a.y, value = _a.value;
        var properties = this.properties;
        if ((0, mobx_1.isObservable)(properties)) {
            properties = (0, mobx_1.toJS)(properties);
        }
        if ((0, lodash_es_1.isNil)(properties.width)) {
            // resize()的时候会触发this.setProperties({width,height})
            // 然后返回getData()，可以从properties拿到width
            // 但是初始化如果没有在properties传入width，那么getData()就一直无法从properties拿到width
            properties.width = this.width;
        }
        if ((0, lodash_es_1.isNil)(properties.height)) {
            // resize()的时候会触发this.setProperties({width,height})
            // 然后返回getData()，可以从properties拿到height
            // 但是初始化如果没有在properties传入height，那么getData()就一直无法从properties拿到width
            properties.height = this.height;
        }
        var data = {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            properties: properties,
        };
        if (this.rotate) {
            data.rotate = this.rotate;
        }
        // 因为默认模式和节点在上模式下，对边的zIndex要求不高（因为渲染的时候会按照模式对所有元素进行排序）
        // 所以只在递增模式和静态模式下设置zIndex
        if ([constant_1.OverlapMode.INCREASE, constant_1.OverlapMode.STATIC].includes(this.graphModel.overlapMode)) {
            data.zIndex = this.zIndex;
        }
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
     * 用于在历史记录时获取节点数据，
     * 在某些情况下，如果希望某个属性变化不引起history的变化，
     * 可以重写此方法。
     */
    BaseNodeModel.prototype.getHistoryData = function () {
        return this.getData();
    };
    /**
     * 获取当前节点的properties
     */
    BaseNodeModel.prototype.getProperties = function () {
        return (0, mobx_1.toJS)(this.properties);
    };
    /**
     * @overridable 支持重写
     * 获取当前节点最外层g标签Attributes, 例如 className
     * @returns 自定义节点样式
     */
    BaseNodeModel.prototype.getOuterGAttributes = function () {
        return {
            className: '',
        };
    };
    /**
     * @overridable 支持重写
     * 获取当前节点样式
     * @returns 自定义节点样式
     */
    BaseNodeModel.prototype.getNodeStyle = function () {
        return __assign(__assign({}, this.graphModel.theme.baseNode), this.style);
    };
    /**
     * @overridable 支持重写
     * 获取当前节点文本样式
     */
    BaseNodeModel.prototype.getTextStyle = function () {
        // 透传 nodeText
        var nodeText = this.graphModel.theme.nodeText;
        var _a = this.properties.textStyle, textStyle = _a === void 0 ? {} : _a;
        return __assign(__assign({}, (0, lodash_es_1.cloneDeep)(nodeText)), (0, lodash_es_1.cloneDeep)(textStyle));
    };
    /**
     * @overridable 支持重写
     * 获取当前节点旋转控制点的样式
     */
    BaseNodeModel.prototype.getRotateControlStyle = function () {
        var rotateControl = this.graphModel.theme.rotateControl;
        return (0, lodash_es_1.cloneDeep)(rotateControl);
    };
    /**
     * @overrideable 支持重写
     * 获取当前节点缩放控制节点的样式
     */
    BaseNodeModel.prototype.getResizeControlStyle = function () {
        var resizeControl = this.graphModel.theme.resizeControl;
        return (0, lodash_es_1.cloneDeep)(resizeControl);
    };
    BaseNodeModel.prototype.getResizeOutlineStyle = function () {
        var resizeOutline = this.graphModel.theme.resizeOutline;
        var attributes = __assign({}, resizeOutline);
        if (this.isHovered) {
            var hoverStyle = resizeOutline.hover || {};
            attributes = __assign(__assign({}, attributes), hoverStyle);
        }
        return (0, lodash_es_1.cloneDeep)(attributes);
    };
    /**
     * @overridable 支持重写
     * 获取当前节点锚点样式
     * @returns 自定义样式
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseNodeModel.prototype.getAnchorStyle = function (_anchorInfo) {
        var anchor = this.graphModel.theme.anchor;
        // 防止被重写覆盖主题。
        return (0, lodash_es_1.cloneDeep)(anchor);
    };
    /**
     * @overridable 支持重写
     * 获取当前节点锚点拖出连线样式
     * @returns 自定义锚点拖出样式
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseNodeModel.prototype.getAnchorLineStyle = function (_anchorInfo) {
        var anchorLine = this.graphModel.theme.anchorLine;
        return (0, lodash_es_1.cloneDeep)(anchorLine);
    };
    /**
     * @overridable 支持重写
     * 获取outline样式，重写可以定义此类型节点outline样式， 默认使用主题样式
     * @returns 自定义outline样式
     */
    BaseNodeModel.prototype.getOutlineStyle = function () {
        var outline = this.graphModel.theme.outline;
        return (0, lodash_es_1.cloneDeep)(outline);
    };
    /**
     * @overridable 在连接边时，是否允许这个节点为 source 节点，边到 target 节点
     * @param target 目标节点
     * @param sourceAnchor 源锚点
     * @param targetAnchor 目标锚点
     * @param edgeId 调整后边的 id，在开启 adjustEdgeStartAndEnd 后调整边连接的节点时会传入
     * 详见：https://github.com/didi/LogicFlow/issues/926#issuecomment-1371823306
     */
    BaseNodeModel.prototype.isAllowConnectedAsSource = function (target, sourceAnchor, targetAnchor, edgeId) {
        var rules = !this.hasSetSourceRules
            ? this.getConnectedSourceRules()
            : this.sourceRules;
        this.hasSetSourceRules = true;
        var isAllPass = true;
        var msg = '';
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (!rule.validate.call(this, this, target, sourceAnchor, targetAnchor, edgeId)) {
                isAllPass = false;
                msg = rule.message;
                break;
            }
        }
        return {
            isAllPass: isAllPass,
            msg: msg,
        };
    };
    /**
     * 获取当前节点作为连接的起始节点规则。
     */
    BaseNodeModel.prototype.getConnectedSourceRules = function () {
        return this.sourceRules;
    };
    /**
     * @overridable 在连线时，判断是否允许这个节点为 target 节点
     * @param source 源节点
     * @param sourceAnchor 源锚点
     * @param targetAnchor 目标锚点
     * @param edgeId 调整后边的 id，在开启 adjustEdgeStartAndEnd 后调整边连接的节点时会传入
     * 详见：https://github.com/didi/LogicFlow/issues/926#issuecomment-1371823306
     */
    BaseNodeModel.prototype.isAllowConnectedAsTarget = function (source, sourceAnchor, targetAnchor, edgeId) {
        var rules = !this.hasSetTargetRules
            ? this.getConnectedTargetRules()
            : this.targetRules;
        this.hasSetTargetRules = true;
        var isAllPass = true;
        var msg = '';
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (!rule.validate.call(this, source, this, sourceAnchor, targetAnchor, edgeId)) {
                isAllPass = false;
                msg = rule.message;
                break;
            }
        }
        return {
            isAllPass: isAllPass,
            msg: msg,
        };
    };
    /**
     * 内部方法
     * 是否允许移动节点到新的位置
     */
    BaseNodeModel.prototype.isAllowMoveNode = function (deltaX, deltaY) {
        var e_1, _a;
        var isAllowMoveX = true;
        var isAllowMoveY = true;
        var rules = this.moveRules.concat(this.graphModel.nodeMoveRules);
        try {
            for (var rules_1 = __values(rules), rules_1_1 = rules_1.next(); !rules_1_1.done; rules_1_1 = rules_1.next()) {
                var rule = rules_1_1.value;
                var r = rule(this, deltaX, deltaY);
                if (!r)
                    return false;
                if (typeof r === 'object') {
                    var r1 = r;
                    if (!r1.x && !r1.y) {
                        return false;
                    }
                    isAllowMoveX = isAllowMoveX && r1.x;
                    isAllowMoveY = isAllowMoveY && r1.y;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (rules_1_1 && !rules_1_1.done && (_a = rules_1.return)) _a.call(rules_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return {
            x: isAllowMoveX,
            y: isAllowMoveY,
        };
    };
    /**
     * 获取作为连线终点时的所有规则。
     */
    BaseNodeModel.prototype.getConnectedTargetRules = function () {
        return this.targetRules;
    };
    /**
     * @returns Point[] 锚点坐标构成的数组
     */
    BaseNodeModel.prototype.getAnchorsByOffset = function () {
        var _a = this, anchorsOffset = _a.anchorsOffset, id = _a.id, x = _a.x, y = _a.y;
        if (anchorsOffset && anchorsOffset.length > 0) {
            return anchorsOffset.map(function (el, idx) {
                if (el.length) {
                    el = el; // 历史数据格式
                    return {
                        id: "".concat(id, "_").concat(idx),
                        x: x + el[0],
                        y: y + el[1],
                    };
                }
                el = el;
                return __assign(__assign({}, el), { x: x + el.x, y: y + el.y, id: el.id || "".concat(id, "_").concat(idx) });
            });
        }
        return this.getDefaultAnchor();
    };
    /**
     * @overridable 子类重写此方法设置默认锚点
     * 获取节点默认情况下的锚点
     */
    BaseNodeModel.prototype.getDefaultAnchor = function () {
        return [];
    };
    /**
     * @overridable 子类重写此方法获取手动连接边到节点时，需要连接的锚点
     * 手动连接边到节点时，需要连接的锚点
     */
    BaseNodeModel.prototype.getTargetAnchor = function (position) {
        var _a;
        var customTargetAnchor = this.graphModel.customTargetAnchor;
        return ((_a = customTargetAnchor === null || customTargetAnchor === void 0 ? void 0 : customTargetAnchor(this, position)) !== null && _a !== void 0 ? _a : (0, util_1.getClosestAnchor)(position, this));
    };
    /**
     * 获取节点BBox
     */
    BaseNodeModel.prototype.getBounds = function () {
        return {
            minX: this.x - this.width / 2,
            minY: this.y - this.height / 2,
            maxX: this.x + this.width / 2,
            maxY: this.y + this.height / 2,
        };
    };
    Object.defineProperty(BaseNodeModel.prototype, "anchors", {
        get: function () {
            var anchors = this.getAnchorsByOffset();
            var _a = this, x = _a.x, y = _a.y, rotate = _a.rotate;
            anchors.forEach(function (anchor) {
                var anchorX = anchor.x, anchorY = anchor.y;
                var _a = __read(new util_1.Matrix([anchorX, anchorY, 1])
                    .translate(-x, -y)
                    .rotate(rotate)
                    .translate(x, y)[0], 2), e = _a[0], f = _a[1];
                anchor.x = e;
                anchor.y = f;
            });
            return anchors;
        },
        enumerable: false,
        configurable: true
    });
    BaseNodeModel.prototype.getAnchorInfo = function (anchorId) {
        if ((0, lodash_es_1.isNil)(anchorId))
            return undefined;
        for (var i = 0; i < this.anchors.length; i++) {
            var anchor = this.anchors[i];
            if (anchor.id === anchorId) {
                return anchor;
            }
        }
    };
    BaseNodeModel.prototype.addNodeMoveRules = function (fn) {
        if (!this.moveRules.includes(fn)) {
            this.moveRules.push(fn);
        }
    };
    BaseNodeModel.prototype.isAllowMoveByXORY = function (deltaX, deltaY, isIgnoreRule) {
        var isAllowMoveX;
        var isAllowMoveY;
        if (isIgnoreRule) {
            isAllowMoveX = true;
            isAllowMoveY = true;
        }
        else {
            var r = this.isAllowMoveNode(deltaX, deltaY);
            if (typeof r === 'boolean') {
                isAllowMoveX = r;
                isAllowMoveY = r;
            }
            else {
                isAllowMoveX = r.x;
                isAllowMoveY = r.y;
            }
        }
        return {
            isAllowMoveX: isAllowMoveX,
            isAllowMoveY: isAllowMoveY,
        };
    };
    BaseNodeModel.prototype.move = function (deltaX, deltaY, isIgnoreRule) {
        if (isIgnoreRule === void 0) { isIgnoreRule = false; }
        var _a = this.isAllowMoveByXORY(deltaX, deltaY, isIgnoreRule), isAllowMoveX = _a.isAllowMoveX, isAllowMoveY = _a.isAllowMoveY;
        if (isAllowMoveX) {
            this.x = this.x + deltaX;
            this.text && this.moveText(deltaX, 0);
        }
        if (isAllowMoveY) {
            this.y = this.y + deltaY;
            this.text && this.moveText(0, deltaY);
        }
        if (isAllowMoveX || isAllowMoveY) {
            // 更新x和y的同时也要更新对应的transform旋转矩阵（依赖x、y)
            this.rotate = this._rotate;
        }
        return isAllowMoveX || isAllowMoveY;
    };
    BaseNodeModel.prototype.getMoveDistance = function (deltaX, deltaY, isIgnoreRule) {
        if (isIgnoreRule === void 0) { isIgnoreRule = false; }
        var _a = this.isAllowMoveByXORY(deltaX, deltaY, isIgnoreRule), isAllowMoveX = _a.isAllowMoveX, isAllowMoveY = _a.isAllowMoveY;
        var moveX = 0;
        var moveY = 0;
        if (isAllowMoveX && deltaX) {
            this.x = this.x + deltaX;
            this.text && this.moveText(deltaX, 0);
            moveX = deltaX;
        }
        if (isAllowMoveY && deltaY) {
            this.y = this.y + deltaY;
            this.text && this.moveText(0, deltaY);
            moveY = deltaY;
        }
        this.transform = new util_1.TranslateMatrix(-this.x, -this.y)
            .rotate(this.rotate)
            .translate(this.x, this.y)
            .toString();
        return [moveX, moveY];
    };
    BaseNodeModel.prototype.moveTo = function (x, y, isIgnoreRule) {
        if (isIgnoreRule === void 0) { isIgnoreRule = false; }
        var deltaX = x - this.x;
        var deltaY = y - this.y;
        if (!isIgnoreRule && !this.isAllowMoveNode(deltaX, deltaY))
            return false;
        this.text && this.moveText(deltaX, deltaY);
        this.x = x;
        this.y = y;
        return true;
    };
    BaseNodeModel.prototype.moveText = function (deltaX, deltaY) {
        var _a = this.text, x = _a.x, y = _a.y, value = _a.value, draggable = _a.draggable, editable = _a.editable;
        this.text = {
            value: value,
            editable: editable,
            draggable: draggable,
            x: x + deltaX,
            y: y + deltaY,
        };
    };
    BaseNodeModel.prototype.updateText = function (value) {
        this.text = __assign(__assign({}, (0, mobx_1.toJS)(this.text)), { value: value });
    };
    BaseNodeModel.prototype.addNodeResizeRules = function (fn) {
        if (!this.resizeRules.includes(fn)) {
            this.resizeRules.push(fn);
        }
    };
    /**
     * 内部方法
     * 是否允许resize节点到新的位置
     */
    BaseNodeModel.prototype.isAllowResizeNode = function (deltaX, deltaY, width, height) {
        var e_2, _a;
        var rules = this.resizeRules.concat(this.graphModel.nodeResizeRules);
        try {
            for (var rules_2 = __values(rules), rules_2_1 = rules_2.next(); !rules_2_1.done; rules_2_1 = rules_2.next()) {
                var rule = rules_2_1.value;
                var r = rule(this, deltaX, deltaY, width, height);
                if (!r)
                    return false;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (rules_2_1 && !rules_2_1.done && (_a = rules_2.return)) _a.call(rules_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return true;
    };
    BaseNodeModel.prototype.setSelected = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isSelected = flag;
    };
    BaseNodeModel.prototype.setHovered = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isHovered = flag;
        this.setIsShowAnchor(flag);
    };
    BaseNodeModel.prototype.setIsShowAnchor = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isShowAnchor = flag;
    };
    BaseNodeModel.prototype.setRotatable = function (flag) {
        if (flag === void 0) { flag = true; }
        this.rotatable = flag;
    };
    BaseNodeModel.prototype.setResizable = function (flag) {
        if (flag === void 0) { flag = true; }
        this.resizable = flag;
    };
    BaseNodeModel.prototype.setHitable = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isHitable = flag;
    };
    BaseNodeModel.prototype.setHittable = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isHittable = flag;
    };
    BaseNodeModel.prototype.setElementState = function (state, additionStateData) {
        this.state = state;
        this.additionStateData = additionStateData;
    };
    BaseNodeModel.prototype.updateProperties = function (nextProperties, updateKeys) {
        var preProperties = (0, mobx_1.toJS)(this.properties);
        this.properties = nextProperties;
        this.setAttributes();
        // 触发更新节点 node:properties-change 的事件
        this.graphModel.eventCenter.emit(constant_1.EventType.NODE_PROPERTIES_CHANGE, {
            id: this.id,
            keys: updateKeys,
            preProperties: preProperties,
            properties: nextProperties,
        });
    };
    BaseNodeModel.prototype.setProperty = function (key, val) {
        var preProperties = (0, mobx_1.toJS)(this.properties);
        var nextProperties = (0, lodash_es_1.cloneDeep)(preProperties);
        // https://lodash.com/docs/4.17.15#set
        // 使用 lodash 的 set 方法更新某个属性，可以支持 key 为 'a.b.c' 的情况
        (0, lodash_es_1.set)(nextProperties, key, (0, util_1.formatData)(val));
        this.updateProperties(nextProperties, [key]);
    };
    BaseNodeModel.prototype.setProperties = function (properties) {
        var preProperties = (0, mobx_1.toJS)(this.properties);
        var nextProperties = __assign(__assign({}, preProperties), (0, util_1.formatData)(properties));
        var updateKeys = [];
        (0, lodash_es_1.mapKeys)(properties, function (val, key) {
            // key 存在于上一个 properties 并且与传入的值不相等 或者 key 不存在于上一个 properties
            if (((0, lodash_es_1.has)(preProperties, key) && preProperties[key] !== val) ||
                !(0, lodash_es_1.has)(preProperties, key)) {
                updateKeys.push(key);
            }
        });
        this.updateProperties(nextProperties, updateKeys);
    };
    BaseNodeModel.prototype.deleteProperty = function (key) {
        delete this.properties[key];
        this.setAttributes();
    };
    BaseNodeModel.prototype.setStyle = function (key, val) {
        var _a;
        this.style = __assign(__assign({}, this.style), (_a = {}, _a[key] = (0, util_1.formatData)(val), _a));
    };
    BaseNodeModel.prototype.setStyles = function (styles) {
        this.style = __assign(__assign({}, this.style), (0, util_1.formatData)(styles));
    };
    BaseNodeModel.prototype.updateStyles = function (styles) {
        this.style = __assign({}, (0, util_1.formatData)(styles));
    };
    BaseNodeModel.prototype.setZIndex = function (zIndex) {
        if (zIndex === void 0) { zIndex = 1; }
        this.zIndex = zIndex;
    };
    BaseNodeModel.prototype.updateAttributes = function (attributes) {
        (0, lodash_es_1.assign)(this, attributes);
    };
    // 堆叠模式变化时，更新zIndex
    BaseNodeModel.prototype.updateZIndexByOverlap = function (overlapMode, defaultZIndex) {
        switch (overlapMode) {
            case constant_1.OverlapMode.DEFAULT:
                this.zIndex = 1;
                break;
            case constant_1.OverlapMode.EDGE_TOP:
                this.zIndex = 0;
                break;
            case constant_1.OverlapMode.INCREASE:
                this.zIndex = defaultZIndex;
                break;
            default:
                break;
        }
    };
    BaseNodeModel.BaseType = constant_1.ElementType.NODE;
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "type", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "x", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "y", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "textMode", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "text", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "properties", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "_width", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "_height", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "anchorsOffset", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "isSelected", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "isHovered", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "isShowAnchor", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "isDragging", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "isHitable", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "isHittable", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "draggable", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "visible", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "rotatable", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "resizable", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "zIndex", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "state", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "autoToFront", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "style", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "transform", void 0);
    __decorate([
        mobx_1.observable
    ], BaseNodeModel.prototype, "_rotate", void 0);
    __decorate([
        mobx_1.computed
    ], BaseNodeModel.prototype, "incoming", null);
    __decorate([
        mobx_1.computed
    ], BaseNodeModel.prototype, "outgoing", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setTextMode", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "addNodeMoveRules", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "move", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "getMoveDistance", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "moveTo", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "moveText", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "updateText", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "addNodeResizeRules", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setSelected", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setHovered", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setIsShowAnchor", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setRotatable", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setResizable", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setHitable", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setHittable", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setElementState", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setProperty", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setProperties", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "deleteProperty", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setStyle", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setStyles", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "updateStyles", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "setZIndex", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "updateAttributes", null);
    __decorate([
        mobx_1.action
    ], BaseNodeModel.prototype, "updateZIndexByOverlap", null);
    return BaseNodeModel;
}());
exports.BaseNodeModel = BaseNodeModel;
exports.default = BaseNodeModel;
