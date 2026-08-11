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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx } from "preact/jsx-runtime";
import { createElement as h, render } from 'preact/compat';
import { cloneDeep, forEach, indexOf, isNil } from 'lodash-es';
import { observer } from '.';
import { Options as LFOptions } from './options';
import * as _Model from './model';
import { GraphModel, SnaplineModel, } from './model';
import Graph from './view/Graph';
import * as _View from './view';
import { formatData, addThemeMode, removeThemeMode, clearThemeMode, } from './util';
import { Dnd, snapline } from './view/behavior';
import Tool from './tool';
import History from './history';
import Keyboard, { initDefaultShortcut } from './keyboard';
import { ElementType, EventType, } from './constant';
var pluginFlag = Symbol('plugin registered by Logicflow.use');
var LogicFlow = /** @class */ (function () {
    function LogicFlow(options) {
        var _this = this;
        var _a;
        this.viewMap = new Map();
        this.components = [];
        // 插件扩展方法
        this.extension = {};
        /*********************************************************
         * Register 相关
         ********************************************************/
        this.setView = function (type, component) {
            return _this.viewMap.set(type, component);
        };
        // 根据 type 获取对应的 view
        this.getView = function (type) {
            return _this.viewMap.get(type);
        };
        var initOptions = LFOptions.get(options);
        var container = initOptions.container, width = initOptions.width, height = initOptions.height;
        this.options = initOptions;
        this.container = this.initContainer(container, width, height);
        this.graphModel = new GraphModel(__assign(__assign({}, initOptions), { container: this.container }));
        this.plugins = (_a = initOptions.plugins) !== null && _a !== void 0 ? _a : [];
        var eventCenter = this.graphModel.eventCenter;
        this.tool = new Tool(this);
        this.dnd = new Dnd({ lf: this });
        this.history = new History(eventCenter);
        this.keyboard = new Keyboard({
            lf: this,
            keyboard: initOptions.keyboard,
        });
        if (initOptions.snapline !== false) {
            this.snaplineModel = new SnaplineModel(this.graphModel, initOptions.snaplineEpsilon);
            snapline(eventCenter, this.snaplineModel);
        }
        if (!initOptions.isSilentMode) {
            // 先初始化默认内置快捷键，自定义快捷键可以覆盖默认快捷键
            initDefaultShortcut(this, this.graphModel);
            // 然后再初始化自定义快捷键，自定义快捷键可以覆盖默认快捷键.
            // 插件最后初始化。方便插件强制覆盖内置快捷键
            this.keyboard.initShortcuts();
        }
        this.defaultRegister();
        this.installPlugins(initOptions.disabledPlugins);
    }
    LogicFlow.prototype.initContainer = function (container, width, height) {
        // TODO: 确认是否需要，后续是否只要返回 container 即可（下面方法是为了解决事件绑定问题的）
        // fix: destroy keyboard events while destroy LogicFlow.(#1110)
        var lfContainer = document.createElement('div');
        lfContainer.style.position = 'relative';
        lfContainer.style.width = width ? "".concat(width, "px") : '100%';
        lfContainer.style.height = height ? "".concat(height, "px") : '100%';
        container.innerHTML = '';
        container.appendChild(lfContainer);
        return lfContainer;
    };
    Object.defineProperty(LogicFlow.prototype, Symbol.toStringTag, {
        get: function () {
            return LogicFlow.toStringTag;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 注册自定义节点和边
     * 支持两种方式
     * 方式一（推荐）
     * 详情见 todo: docs link
     * @example
     * import { RectNode, RectModel } from '@logicflow/core'
     * class CustomView extends RectNode {
     * }
     * class CustomModel extends RectModel {
     * }
     * lf.register({
     *   type: 'custom',
     *   view: CustomView,
     *   model: CustomModel
     * })
     * 方式二
     * 不推荐，极个别在自定义的时候需要用到lf的情况下可以用这种方式。
     * 大多数情况下，我们可以直接在view中从this.props中获取graphModel
     * 或者model中直接this.graphModel获取model的方法。
     * @example
     * lf.register('custom', ({ RectNode, RectModel }) => {
     *    class CustomView extends RectNode {}
     *    class CustomModel extends RectModel {}
     *    return {
     *      view: CustomView,
     *      model: CustomModel
     *    }
     * })
     */
    LogicFlow.prototype.register = function (element, fn, isObserverView) {
        if (isObserverView === void 0) { isObserverView = true; }
        // 方式1
        if (typeof element !== 'string') {
            this.registerElement(element);
            return;
        }
        // 方式2 TODO: 优化下面这段代码，没太看懂这一块的背景
        var registerParam = {
            BaseEdge: _View.BaseEdge,
            BaseEdgeModel: _Model.BaseEdgeModel,
            BaseNode: _View.BaseNode,
            BaseNodeModel: _Model.BaseNodeModel,
            RectNode: _View.RectNode,
            RectNodeModel: _Model.RectNodeModel,
            CircleNode: _View.CircleNode,
            CircleNodeModel: _Model.CircleNodeModel,
            PolygonNode: _View.PolygonNode,
            PolygonNodeModel: _Model.PolygonNodeModel,
            TextNode: _View.TextNode,
            TextNodeModel: _Model.TextNodeModel,
            LineEdge: _View.LineEdge,
            LineEdgeModel: _Model.LineEdgeModel,
            DiamondNode: _View.DiamondNode,
            DiamondNodeModel: _Model.DiamondNodeModel,
            PolylineEdge: _View.PolylineEdge,
            PolylineEdgeModel: _Model.PolylineEdgeModel,
            BezierEdge: _View.BezierEdge,
            BezierEdgeModel: _Model.BezierEdgeModel,
            EllipseNode: _View.EllipseNode,
            EllipseNodeModel: _Model.EllipseNodeModel,
            HtmlNode: _View.HtmlNode,
            HtmlNodeModel: _Model.HtmlNodeModel,
            // mobx,
            h: h,
            type: element,
        };
        // 为了能让后来注册的可以继承前面注册的
        // 例如我注册一个“开始节点”
        // 然后我再想注册一个“立即开始节点”
        // 注册传递参数改为动态。
        // TODO: 确定 extendKey 的作用
        this.viewMap.forEach(function (component) {
            var key = component.extendKey;
            if (key) {
                registerParam[key] = component;
            }
        });
        this.graphModel.modelMap.forEach(function (component) {
            var key = component.extendKey;
            if (key) {
                registerParam[key] = component;
            }
        });
        if (fn) {
            var _a = fn(registerParam), ViewClass = _a.view, ModelClass = _a.model;
            var vClass = ViewClass; // TODO: 确认 ViewClass 类型
            if (isObserverView && !vClass.isObserved) {
                vClass.isObserved = true;
                vClass = observer(vClass);
            }
            this.setView(element, vClass);
            this.graphModel.setModel(element, ModelClass);
        }
    };
    /**
     * 注册元素（节点 or 边）
     * @param config 注册元素的配置项
     * @private
     */
    LogicFlow.prototype.registerElement = function (config) {
        var ViewComp = config.view;
        if (config.isObserverView !== false && !ViewComp.isObserved) {
            ViewComp.isObserved = true;
            ViewComp = observer(ViewComp);
        }
        this.setView(config.type, ViewComp);
        this.graphModel.setModel(config.type, config.model);
    };
    /**
     * 批量注册元素
     * @param elements 注册的元素
     */
    LogicFlow.prototype.batchRegister = function (elements) {
        var _this = this;
        if (elements === void 0) { elements = []; }
        forEach(elements, function (element) {
            _this.registerElement(element);
        });
    };
    LogicFlow.prototype.defaultRegister = function () {
        // LogicFlow default Nodes and Edges
        var defaultElements = [
            // Node
            {
                type: 'rect',
                view: _View.RectNode,
                model: _Model.RectNodeModel,
            },
            {
                type: 'circle',
                view: _View.CircleNode,
                model: _Model.CircleNodeModel,
            },
            {
                type: 'polygon',
                view: _View.PolygonNode,
                model: _Model.PolygonNodeModel,
            },
            {
                type: 'text',
                view: _View.TextNode,
                model: _Model.TextNodeModel,
            },
            {
                type: 'ellipse',
                view: _View.EllipseNode,
                model: _Model.EllipseNodeModel,
            },
            {
                type: 'diamond',
                view: _View.DiamondNode,
                model: _Model.DiamondNodeModel,
            },
            {
                type: 'html',
                view: _View.HtmlNode,
                model: _Model.HtmlNodeModel,
            },
            // Edge
            {
                type: 'line',
                view: _View.LineEdge,
                model: _Model.LineEdgeModel,
            },
            {
                type: 'polyline',
                view: _View.PolylineEdge,
                model: _Model.PolylineEdgeModel,
            },
            {
                type: 'bezier',
                view: _View.BezierEdge,
                model: _Model.BezierEdgeModel,
            },
        ];
        this.batchRegister(defaultElements);
    };
    /*********************************************************
     * Node 相关方法
     ********************************************************/
    /**
     * 添加节点
     * @param nodeConfig 节点配置
     * @param eventType 新增节点事件类型，默认EventType.NODE_ADD
     * @param e MouseEvent 事件
     */
    LogicFlow.prototype.addNode = function (nodeConfig, eventType, e) {
        if (eventType === void 0) { eventType = EventType.NODE_ADD; }
        return this.graphModel.addNode(nodeConfig, eventType, e);
    };
    /**
     * 删除节点
     * @param {string} nodeId 节点Id
     */
    LogicFlow.prototype.deleteNode = function (nodeId) {
        var nodeModel = this.graphModel.getNodeModelById(nodeId);
        if (!nodeModel)
            return false;
        var nodeData = nodeModel.getData();
        var guards = this.options.guards;
        var isEnableDelete = (guards === null || guards === void 0 ? void 0 : guards.beforeDelete)
            ? guards.beforeDelete(nodeData)
            : true;
        if (isEnableDelete) {
            this.graphModel.deleteNode(nodeId);
        }
        return isEnableDelete;
    };
    /**
     * 克隆节点
     * @param nodeId 节点Id
     */
    LogicFlow.prototype.cloneNode = function (nodeId) {
        var nodeModel = this.graphModel.getNodeModelById(nodeId);
        var nodeData = nodeModel === null || nodeModel === void 0 ? void 0 : nodeModel.getData();
        if (nodeData) {
            var guards = this.options.guards;
            var isEnableClone = (guards === null || guards === void 0 ? void 0 : guards.beforeClone)
                ? guards.beforeClone(nodeData)
                : true;
            if (isEnableClone) {
                return this.graphModel.cloneNode(nodeId);
            }
        }
    };
    /**
     * 修改节点的id，如果不传新的id，会内部自动创建一个。
     * @param { string } nodeId 将要被修改的id
     * @param { string } newId 可选，修改后的id
     * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
     */
    LogicFlow.prototype.changeNodeId = function (nodeId, newId) {
        return this.graphModel.changeNodeId(nodeId, newId);
    };
    /**
     * 修改指定节点类型
     * @param nodeId 节点id
     * @param type 节点类型
     */
    LogicFlow.prototype.changeNodeType = function (nodeId, type) {
        this.graphModel.changeNodeType(nodeId, type);
    };
    /**
     * 获取节点对象
     * @param nodeId 节点Id
     */
    LogicFlow.prototype.getNodeModelById = function (nodeId) {
        return this.graphModel.getNodeModelById(nodeId);
    };
    /**
     * 获取节点数据
     * @param nodeId 节点
     */
    LogicFlow.prototype.getNodeDataById = function (nodeId) {
        var nodeModel = this.getNodeModelById(nodeId);
        return nodeModel === null || nodeModel === void 0 ? void 0 : nodeModel.getData();
    };
    /**
     * 获取所有以此节点为终点的边
     * @param { string } nodeId
     */
    LogicFlow.prototype.getNodeIncomingEdge = function (nodeId) {
        return this.graphModel.getNodeIncomingEdge(nodeId);
    };
    /**
     * 获取所有以此节点为起点的边
     * @param {string} nodeId
     */
    LogicFlow.prototype.getNodeOutgoingEdge = function (nodeId) {
        return this.graphModel.getNodeOutgoingEdge(nodeId);
    };
    /**
     * 获取节点连接到的所有起始节点
     * @param {string} nodeId
     */
    LogicFlow.prototype.getNodeIncomingNode = function (nodeId) {
        return this.graphModel.getNodeIncomingNode(nodeId);
    };
    /**
     * 获取节点连接到的所有目标节点
     * @param {string} nodeId
     */
    LogicFlow.prototype.getNodeOutgoingNode = function (nodeId) {
        return this.graphModel.getNodeOutgoingNode(nodeId);
    };
    /**
     * 内部保留方法
     * 创建一个fakeNode，用于dnd插件拖动节点进画布的时候使用。
     */
    LogicFlow.prototype.createFakeNode = function (nodeConfig) {
        var Model = this.graphModel.modelMap.get(nodeConfig.type);
        if (!Model) {
            console.warn("\u4E0D\u5B58\u5728\u4E3A".concat(nodeConfig.type, "\u7C7B\u578B\u7684\u8282\u70B9"));
            return null;
        }
        // * initNodeData区分是否为虚拟节点
        var fakeNodeModel = new Model(__assign(__assign({}, nodeConfig), { virtual: true }), this.graphModel);
        this.graphModel.setFakeNode(fakeNodeModel);
        return fakeNodeModel;
    };
    /**
     * 内部保留方法
     * 移除fakeNode
     */
    LogicFlow.prototype.removeFakeNode = function () {
        this.graphModel.removeFakeNode();
    };
    /**
     * 内部保留方法
     * 用于fakeNode显示对齐线
     */
    LogicFlow.prototype.setNodeSnapLine = function (data) {
        var _a;
        (_a = this.snaplineModel) === null || _a === void 0 ? void 0 : _a.setNodeSnapLine(data);
    };
    /**
     * 内部保留方法
     * 用于fakeNode移除对齐线
     */
    LogicFlow.prototype.removeNodeSnapLine = function () {
        var _a;
        (_a = this.snaplineModel) === null || _a === void 0 ? void 0 : _a.clearSnapline();
    };
    /*********************************************************
     * Edge 相关方法
     ********************************************************/
    /**
     * 设置默认的边类型。
     * 也就是设置在节点直接由用户手动绘制的连线类型。
     * @param type LFOptions.EdgeType
     */
    LogicFlow.prototype.setDefaultEdgeType = function (type) {
        this.graphModel.setDefaultEdgeType(type);
    };
    /**
     * 给两个节点之间添加一条边
     * @example
     * lf.addEdge({
     *   type: 'polygon'
     *   sourceNodeId: 'node_id_1',
     *   targetNodeId: 'node_id_2',
     * })
     * @param {EdgeConfig} edgeConfig
     */
    LogicFlow.prototype.addEdge = function (edgeConfig) {
        return this.graphModel.addEdge(edgeConfig);
    };
    /**
     * 基于id获取边数据
     * @param edgeId 边Id
     * @returns EdgeData
     */
    LogicFlow.prototype.getEdgeDataById = function (edgeId) {
        var edgeModel = this.getEdgeModelById(edgeId);
        return edgeModel === null || edgeModel === void 0 ? void 0 : edgeModel.getData();
    };
    /**
     * 基于边Id获取边的model
     * @param edgeId 边的Id
     * @return model
     */
    LogicFlow.prototype.getEdgeModelById = function (edgeId) {
        return this.graphModel.getEdgeModelById(edgeId);
    };
    /**
     * 获取满足条件边的model
     * @param edgeFilter 过滤条件
     * @example
     * 获取所有起点为节点 A 的边的 model
     * lf.getEdgeModels({
     *   sourceNodeId: 'nodeA_id'
     * })
     * 获取所有终点为节点 B 的边的 model
     * lf.getEdgeModels({
     *   targetNodeId: 'nodeB_id'
     * })
     * 获取起点为节点 A，终点为节点 B 的边
     * lf.getEdgeModels({
     *   sourceNodeId: 'nodeA_id',
     *   targetNodeId: 'nodeB_id'
     * })
     * @return model数组
     */
    LogicFlow.prototype.getEdgeModels = function (_a) {
        var sourceNodeId = _a.sourceNodeId, targetNodeId = _a.targetNodeId;
        var results = [];
        var edges = this.graphModel.edges;
        if (sourceNodeId && targetNodeId) {
            forEach(edges, function (edge) {
                if (edge.sourceNodeId === sourceNodeId &&
                    edge.targetNodeId === targetNodeId) {
                    results.push(edge);
                }
            });
        }
        else if (sourceNodeId) {
            forEach(edges, function (edge) {
                if (edge.sourceNodeId === sourceNodeId) {
                    results.push(edge);
                }
            });
        }
        else if (targetNodeId) {
            forEach(edges, function (edge) {
                if (edge.targetNodeId === targetNodeId) {
                    results.push(edge);
                }
            });
        }
        return results;
    };
    /**
     * 修改边的id， 如果不传新的id，会内部自动创建一个。
     * @param { string } edgeId 将要被修改的id
     * @param { string } newId 可选，修改后的id
     * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
     */
    LogicFlow.prototype.changeEdgeId = function (edgeId, newId) {
        return this.graphModel.changeEdgeId(edgeId, newId);
    };
    /**
     * 切换边的类型
     * @param edgeId 边Id
     * @param type 边类型
     */
    LogicFlow.prototype.changeEdgeType = function (edgeId, type) {
        this.graphModel.changeEdgeType(edgeId, type);
    };
    /**
     * 删除边
     * @param {string} edgeId 边Id
     */
    LogicFlow.prototype.deleteEdge = function (edgeId) {
        var edgeModel = this.graphModel.getEdgeModelById(edgeId);
        if (!edgeModel)
            return false;
        var edgeData = edgeModel.getData();
        var guards = this.options.guards;
        var isEnableDelete = (guards === null || guards === void 0 ? void 0 : guards.beforeDelete)
            ? guards.beforeDelete(edgeData)
            : true;
        if (isEnableDelete) {
            this.graphModel.deleteEdgeById(edgeId);
        }
        return isEnableDelete;
    };
    /**
     * 基于给定节点（作为边起点或终点，可以只传其一），删除对应的边
     * @param sourceNodeId 边的起点节点ID
     * @param targetNodeId 边的终点节点ID
     */
    LogicFlow.prototype.deleteEdgeByNodeId = function (_a) {
        var sourceNodeId = _a.sourceNodeId, targetNodeId = _a.targetNodeId;
        // TODO: 将下面方法从 this.graphModel 解构，并测试代码功能是否正常（需要确认 this 指向是否有异常）
        if (sourceNodeId && targetNodeId) {
            this.graphModel.deleteEdgeBySourceAndTarget(sourceNodeId, targetNodeId);
        }
        else if (sourceNodeId) {
            this.graphModel.deleteEdgeBySource(sourceNodeId);
        }
        else if (targetNodeId) {
            this.graphModel.deleteEdgeByTarget(targetNodeId);
        }
    };
    /**
     * 获取节点连接的所有边的model
     * @param nodeId 节点ID
     * @returns model数组
     */
    LogicFlow.prototype.getNodeEdges = function (nodeId) {
        return this.graphModel.getNodeEdges(nodeId);
    };
    /*********************************************************
     * Element 相关方法
     ********************************************************/
    /**
     * 添加多个元素, 包括边和节点。
     * @param nodes
     * @param edges
     * @param distance
     */
    LogicFlow.prototype.addElements = function (_a, distance) {
        var _this = this;
        var nodes = _a.nodes, edges = _a.edges;
        if (distance === void 0) { distance = 40; }
        // TODO: 1. 解决下面方法中 distance 传参缺未使用的问题；该方法在快捷键中有调用
        // TODO: 2. review 一下本函数代码逻辑，确认 nodeIdMap 的作用，看是否有优化的空间
        console.log('distance', distance);
        var nodeIdMap = {};
        var elements = {
            nodes: [],
            edges: [],
        };
        forEach(nodes, function (node) {
            var nodeId = node.id;
            var nodeModel = _this.addNode(node);
            if (nodeId)
                nodeIdMap[nodeId] = nodeModel.id;
            elements.nodes.push(nodeModel);
        });
        forEach(edges, function (edge) {
            var sourceNodeId = edge.sourceNodeId, targetNodeId = edge.targetNodeId;
            if (nodeIdMap[sourceNodeId])
                sourceNodeId = nodeIdMap[sourceNodeId];
            if (nodeIdMap[targetNodeId])
                targetNodeId = nodeIdMap[targetNodeId];
            var edgeModel = _this.graphModel.addEdge(__assign(__assign({}, edge), { sourceNodeId: sourceNodeId, targetNodeId: targetNodeId }));
            elements.edges.push(edgeModel);
        });
        return elements;
    };
    /**
     * 将图形选中
     * @param id 选择元素ID
     * @param multiple 是否允许多选，如果为true，不会将上一个选中的元素重置
     * @param toFront 是否将选中的元素置顶，默认为true
     */
    LogicFlow.prototype.selectElementById = function (id, multiple, toFront) {
        if (multiple === void 0) { multiple = false; }
        if (toFront === void 0) { toFront = true; }
        this.graphModel.selectElementById(id, multiple);
        if (!multiple && toFront) {
            this.graphModel.toFront(id);
        }
    };
    /**
     * 移除选中的元素
     * @param id 元素ID
     */
    LogicFlow.prototype.deselectElementById = function (id) {
        this.graphModel.deselectElementById(id);
    };
    /**
     * 获取选中的元素数据
     * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的边,默认包括。
     * 注意：复制的时候不能包括此类边, 因为复制的时候不允许悬空的边。
     */
    LogicFlow.prototype.getSelectElements = function (isIgnoreCheck) {
        if (isIgnoreCheck === void 0) { isIgnoreCheck = true; }
        return this.graphModel.getSelectElements(isIgnoreCheck);
    };
    /**
     * 将所有选中的元素设置为非选中
     */
    LogicFlow.prototype.clearSelectElements = function () {
        this.graphModel.clearSelectElements();
    };
    /**
     * 获取节点或边对象
     * @param id id
     */
    LogicFlow.prototype.getModelById = function (id) {
        return this.graphModel.getElement(id);
    };
    /**
     * 获取节点或边的数据
     * @param id id
     */
    LogicFlow.prototype.getDataById = function (id) {
        var _a;
        return (_a = this.graphModel.getElement(id)) === null || _a === void 0 ? void 0 : _a.getData();
    };
    /**
     * 删除元素，在不确定当前id是节点还是边时使用
     * @param id 元素id
     */
    LogicFlow.prototype.deleteElement = function (id) {
        var _a;
        var _b, _c;
        var model = this.getModelById(id);
        if (!model)
            return false;
        var callback = (_a = {},
            _a[ElementType.NODE] = this.deleteNode,
            _a[ElementType.EDGE] = this.deleteEdge,
            _a);
        return (_c = (_b = callback[model.BaseType]) === null || _b === void 0 ? void 0 : _b.call(this, id)) !== null && _c !== void 0 ? _c : false;
    };
    /**
     * 设置元素的zIndex.
     * 注意：默认堆叠模式下，不建议使用此方法。
     * @see todo link 堆叠模式
     * @param id 元素id
     * @param zIndex zIndex的值，可以传数字，也支持传入 'top' 和 'bottom'
     */
    LogicFlow.prototype.setElementZIndex = function (id, zIndex) {
        return this.graphModel.setElementZIndex(id, zIndex);
    };
    /**
     * 获取指定区域内的所有元素，此区域必须是DOM层。
     * 例如鼠标绘制选区后，获取选区内的所有元素。
     * @see todo 分层
     * @param leftTopPoint 区域左上角坐标, dom层坐标
     * @param rightBottomPoint 区域右下角坐标，dom层坐标
     * @param wholeEdge
     * @param wholeNode
     * @param ignoreHideElement
     */
    LogicFlow.prototype.getAreaElement = function (leftTopPoint, rightBottomPoint, wholeEdge, wholeNode, ignoreHideElement) {
        if (wholeEdge === void 0) { wholeEdge = true; }
        if (wholeNode === void 0) { wholeNode = true; }
        if (ignoreHideElement === void 0) { ignoreHideElement = false; }
        return this.graphModel
            .getAreaElement(leftTopPoint, rightBottomPoint, wholeEdge, wholeNode, ignoreHideElement)
            .map(function (element) { return element.getData(); });
    };
    /**
     * 设置元素的自定义属性
     * @see http://logicflow.cn/api/detail#setproperties
     * @param id 元素的id
     * @param properties 自定义属性
     */
    LogicFlow.prototype.setProperties = function (id, properties) {
        var _a;
        (_a = this.graphModel.getElement(id)) === null || _a === void 0 ? void 0 : _a.setProperties(formatData(properties));
    };
    /**
     * 获取元素的自定义属性
     * @param id 元素的id
     * @returns 自定义属性
     */
    LogicFlow.prototype.getProperties = function (id) {
        var _a;
        return (_a = this.graphModel.getElement(id)) === null || _a === void 0 ? void 0 : _a.getProperties();
    };
    LogicFlow.prototype.deleteProperty = function (id, key) {
        var _a;
        (_a = this.graphModel.getElement(id)) === null || _a === void 0 ? void 0 : _a.deleteProperty(key);
    };
    /**
     * FBI WARNING !!! 慎用 === 不要用
     * 修改对应元素 model 中的属性
     * 注意：此方法慎用，除非您对logicflow内部有足够的了解。
     * 大多数情况下，请使用setProperties、updateText、changeNodeId等方法。
     * 例如直接使用此方法修改节点的id,那么就是会导致连接到此节点的边的sourceNodeId出现找不到的情况。
     * @param {string} id 元素id
     * @param {object} attributes 需要更新的属性
     */
    LogicFlow.prototype.updateAttributes = function (id, attributes) {
        this.graphModel.updateAttributes(id, attributes);
    };
    /*********************************************************
     * Text 相关方法
     ********************************************************/
    /**
     * 显示节点、连线文本编辑框
     * @param id 元素id
     */
    LogicFlow.prototype.editText = function (id) {
        this.graphModel.editText(id);
    };
    /**
     * 更新节点或边的文案
     * @param id 节点或者边id
     * @param value 文案内容
     */
    LogicFlow.prototype.updateText = function (id, value) {
        this.graphModel.updateText(id, value);
    };
    /*********************************************************
     * EditConfig 相关方法
     ********************************************************/
    /**
     * 更新流程图编辑相关设置
     * @param {object} config 编辑配置
     * @see http://logicflow.cn/api/detail#updateeditconfig
     */
    LogicFlow.prototype.updateEditConfig = function (config) {
        var _a = this.graphModel, editConfigModel = _a.editConfigModel, transformModel = _a.transformModel;
        var currentSnapGrid = editConfigModel.snapGrid;
        editConfigModel.updateEditConfig(config);
        if ((config === null || config === void 0 ? void 0 : config.stopMoveGraph) !== undefined) {
            transformModel.updateTranslateLimits(config.stopMoveGraph);
        }
        // 静默模式切换时，修改快捷键的启用状态
        (config === null || config === void 0 ? void 0 : config.isSilentMode) ? this.keyboard.disable() : this.keyboard.enable(true);
        // 切换网格对齐状态时，修改网格尺寸
        if (!isNil(config === null || config === void 0 ? void 0 : config.snapGrid) && config.snapGrid !== currentSnapGrid) {
            var _b = this.graphModel.grid.size, size = _b === void 0 ? 1 : _b;
            this.graphModel.updateGridSize(config.snapGrid ? size : 1);
        }
        this.emit(EventType.EDIT_CONFIG_CHANGED, {
            data: editConfigModel.getConfig(),
        });
    };
    /**
     * 获取流程图当前编辑相关设置
     * @see http://logicflow.cn/api/detail#geteditconfig
     */
    LogicFlow.prototype.getEditConfig = function () {
        return this.graphModel.editConfigModel.getConfig();
    };
    /*********************************************************
     * Graph 相关方法
     ********************************************************/
    /**
     * 设置主题样式
     * @param { object } style 自定义主题样式
     * todo docs link
     */
    LogicFlow.prototype.setTheme = function (style, themeMode) {
        this.graphModel.setTheme(style, themeMode);
    };
    /**
     * 获取当前主题样式
     * @see todo docs link
     */
    LogicFlow.prototype.getTheme = function () {
        return this.graphModel.getTheme();
    };
    LogicFlow.prototype.focusByElement = function (id) {
        var coordinate = undefined;
        var nodeModel = this.getNodeModelById(id);
        if (nodeModel) {
            var _a = nodeModel.getData(), x = _a.x, y = _a.y;
            coordinate = {
                x: x,
                y: y,
            };
        }
        var edgeModel = this.getEdgeModelById(id);
        if (edgeModel) {
            var _b = edgeModel.textPosition, x = _b.x, y = _b.y;
            coordinate = {
                x: x,
                y: y,
            };
        }
        if (coordinate) {
            this.focusByCoordinate(coordinate);
        }
    };
    LogicFlow.prototype.focusByCoordinate = function (coordinate) {
        var _a = this.graphModel, transformModel = _a.transformModel, width = _a.width, height = _a.height;
        var x = coordinate.x, y = coordinate.y;
        transformModel.focusOn(x, y, width, height);
    };
    LogicFlow.prototype.focusOn = function (focusOnArgs) {
        if (typeof focusOnArgs === 'string') {
            // string focusOnArgs -> id
            this.focusByElement(focusOnArgs);
        }
        else if ('x' in focusOnArgs && 'y' in focusOnArgs) {
            // Position focusOnArgs -> coordinate
            this.focusByCoordinate(focusOnArgs);
        }
        else {
            // FocusOnArgsType
            var id = focusOnArgs.id, coordinate = focusOnArgs.coordinate;
            if (id) {
                this.focusByElement(id);
            }
            if (coordinate) {
                this.focusByCoordinate(coordinate);
            }
        }
    };
    /**
     * 重新设置画布的宽高
     * 不传会自动计算画布宽高
     */
    LogicFlow.prototype.resize = function (width, height) {
        this.graphModel.resize(width, height);
        this.options.width = this.graphModel.width;
        this.options.height = this.graphModel.height;
    };
    /**
     * 将某个元素放置到顶部。
     * 如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。
     * 如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。
     * @see todo link 堆叠模式
     * @param id 元素Id
     */
    LogicFlow.prototype.toFront = function (id) {
        this.graphModel.toFront(id);
    };
    LogicFlow.prototype.getPointByClient = function (x, y) {
        if (typeof x === 'object') {
            return this.graphModel.getPointByClient(x);
        }
        else if (typeof y === 'number') {
            return this.graphModel.getPointByClient({
                x: x,
                y: y,
            });
        }
    };
    /**
     * 获取流程绘图数据
     * 注意: getGraphData返回的数据受到adapter影响，所以其数据格式不一定是logicflow内部图数据格式。
     * 如果实现通用插件，请使用getGraphRawData
     */
    LogicFlow.prototype.getGraphData = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var data = this.getGraphRawData();
        if (this.adapterOut) {
            return this.adapterOut.apply(this, __spreadArray([data], __read(params), false));
        }
        return data;
    };
    /**
     * 获取流程绘图原始数据
     * 在存在adapter时，可以使用getGraphRawData获取图原始数据
     */
    LogicFlow.prototype.getGraphRawData = function () {
        return this.graphModel.modelToGraphData();
    };
    /**
     * 清空画布
     */
    LogicFlow.prototype.clearData = function () {
        this.graphModel.clearData();
        // 强制刷新数据, 让 preact 清除对已删除节点的引用
        this.render({});
    };
    LogicFlow.prototype.setOverlapMode = function (mode) {
        this.graphModel.setOverlapMode(mode);
    };
    /*********************************************************
     * LogicFlow Render方法
     ********************************************************/
    LogicFlow.prototype.renderRawData = function (graphRawData) {
        this.graphModel.graphDataToModel(formatData(graphRawData));
        if (this.options.history !== false) {
            this.history.watch(this.graphModel);
        }
        render(_jsx(Graph, { getView: this.getView, tool: this.tool, options: this.options, dnd: this.dnd, snaplineModel: this.snaplineModel, graphModel: this.graphModel }), this.container);
        this.emit(EventType.GRAPH_RENDERED, {
            data: this.graphModel.modelToGraphData(),
            graphModel: this.graphModel,
        });
    };
    /**
     * 渲染图
     * @example
     * lf.render({
     *   nodes: [
     *     {
     *       id: 'node_1',
     *       type: 'rect',
     *       x: 100,
     *       y: 100
     *     },
     *     {
     *       id: 'node_2',
     *       type: 'circle',
     *       x: 300,
     *       y: 200
     *     }
     *   ],
     *   edges: [
     *     {
     *       sourceNodeId: 'node_1',
     *       targetNodeId: 'node_2',
     *       type: 'polyline'
     *     }
     *   ]
     * })
     * @param graphData 图数据
     */
    LogicFlow.prototype.render = function (graphData) {
        var graphRawData = cloneDeep(graphData);
        if (this.adapterIn) {
            graphRawData = this.adapterIn(graphRawData);
        }
        this.renderRawData(graphRawData);
    };
    /*********************************************************
     * History/Resize 相关方法
     ********************************************************/
    /**
     * 历史记录操作
     * 返回上一步
     */
    LogicFlow.prototype.undo = function () {
        if (!this.history.undoAble())
            return;
        // formatData兼容vue数据
        var graphData = formatData(this.history.undo());
        this.clearSelectElements();
        this.graphModel.graphDataToModel(graphData);
    };
    /**
     * 历史记录操作
     * 恢复下一步
     */
    LogicFlow.prototype.redo = function () {
        if (!this.history.redoAble())
            return;
        // formatData兼容vue数据
        var graphData = formatData(this.history.redo());
        this.clearSelectElements();
        this.graphModel.graphDataToModel(graphData);
    };
    /**
     * 放大缩小图形
     * @param zoomSize 放大缩小的值，支持传入0-n之间的数字。小于1表示缩小，大于1表示放大。也支持传入true和false按照内置的刻度放大缩小
     * @param point 缩放的原点
     * @returns {string} -放大缩小的比例
     */
    LogicFlow.prototype.zoom = function (zoomSize, point) {
        var transformModel = this.graphModel.transformModel;
        return transformModel.zoom(zoomSize, point);
    };
    /**
     * 重置图形的放大缩写比例为默认
     */
    LogicFlow.prototype.resetZoom = function () {
        var transformModel = this.graphModel.transformModel;
        transformModel.resetZoom();
    };
    /**
     * 设置图形缩小时，能缩放到的最小倍数。参数为0-1自己。默认0.2
     * @param size 图形缩小的最小值
     */
    LogicFlow.prototype.setZoomMiniSize = function (size) {
        var transformModel = this.graphModel.transformModel;
        transformModel.setZoomMiniSize(size);
    };
    /**
     * 设置图形放大时，能放大到的最大倍数，默认16
     * @param size 图形放大的最大值
     */
    LogicFlow.prototype.setZoomMaxSize = function (size) {
        var transformModel = this.graphModel.transformModel;
        transformModel.setZoomMaxSize(size);
    };
    /**
     * 获取缩放的值和平移的值。
     */
    LogicFlow.prototype.getTransform = function () {
        var _a = this.graphModel.transformModel, SCALE_X = _a.SCALE_X, SCALE_Y = _a.SCALE_Y, TRANSLATE_X = _a.TRANSLATE_X, TRANSLATE_Y = _a.TRANSLATE_Y;
        return {
            SCALE_X: SCALE_X,
            SCALE_Y: SCALE_Y,
            TRANSLATE_X: TRANSLATE_X,
            TRANSLATE_Y: TRANSLATE_Y,
        };
    };
    /**
     * 平移图
     * @param x 向x轴移动距离
     * @param y 向y轴移动距离
     */
    LogicFlow.prototype.translate = function (x, y) {
        var transformModel = this.graphModel.transformModel;
        transformModel.translate(x, y);
    };
    /**
     * 还原图形为初始位置
     */
    LogicFlow.prototype.resetTranslate = function () {
        var transformModel = this.graphModel.transformModel;
        var TRANSLATE_X = transformModel.TRANSLATE_X, TRANSLATE_Y = transformModel.TRANSLATE_Y;
        this.translate(-TRANSLATE_X, -TRANSLATE_Y);
    };
    /**
     * 图形画布居中显示
     */
    LogicFlow.prototype.translateCenter = function () {
        this.graphModel.translateCenter();
    };
    /**
     * 图形适应屏幕大小
     * @param verticalOffset number 距离盒子上下的距离， 默认为20
     * @param horizontalOffset number 距离盒子左右的距离， 默认为20
     */
    LogicFlow.prototype.fitView = function (verticalOffset, horizontalOffset) {
        if (horizontalOffset === undefined) {
            horizontalOffset = verticalOffset; // 兼容以前的只传一个参数的情况
        }
        this.graphModel.fitView(verticalOffset, horizontalOffset);
    };
    /**
     * 开启边的动画
     * @param edgeId string
     */
    LogicFlow.prototype.openEdgeAnimation = function (edgeId) {
        this.graphModel.openEdgeAnimation(edgeId);
    };
    /**
     * 关闭边的动画
     * @param edgeId string
     */
    LogicFlow.prototype.closeEdgeAnimation = function (edgeId) {
        this.graphModel.closeEdgeAnimation(edgeId);
    };
    LogicFlow.prototype.on = function (evt, callback) {
        this.graphModel.eventCenter.on(evt, callback);
    };
    LogicFlow.prototype.off = function (evt, callback) {
        this.graphModel.eventCenter.off(evt, callback);
    };
    LogicFlow.prototype.once = function (evt, callback) {
        this.graphModel.eventCenter.once(evt, callback);
    };
    LogicFlow.prototype.emit = function (evt, arg) {
        this.graphModel.eventCenter.emit(evt, arg);
    };
    /*********************************************************
     * 插件系统方法
     ********************************************************/
    /**
     * 添加扩展, 待讨论，这里是不是静态方法好一些？
     * 重复添加插件的时候，把上一次添加的插件的销毁。
     * @param extension
     * @param props
     */
    LogicFlow.use = function (extension, props) {
        var _a;
        var pluginName = extension.pluginName;
        if (!pluginName) {
            throw new Error("\u8BF7\u7ED9\u63D2\u4EF6\u6307\u5B9A pluginName!");
        }
        // TODO: 应该在何时进行插件的销毁？？？
        // const preExtension = this.extensions.get(pluginName)?.extension
        // preExtension?.destroy?.() // 该代码应该有问题，因为 preExtension 直接用的是 Constructor，没有实例化。无法访问实例方法 destroy
        this.extensions.set(pluginName, (_a = {},
            _a[pluginFlag] = pluginFlag,
            _a.extension = extension,
            _a.props = props,
            _a));
    };
    /**
     * 添加主题模式
     * @param themeMode 主题模式
     * @param style 主题样式
     */
    LogicFlow.addThemeMode = function (themeMode, style) {
        addThemeMode(themeMode, style);
    };
    LogicFlow.removeThemeMode = function (themeMode) {
        removeThemeMode(themeMode);
    };
    LogicFlow.clearThemeMode = function () {
        clearThemeMode();
    };
    LogicFlow.prototype.installPlugins = function (disabledPlugins) {
        var _this = this;
        if (disabledPlugins === void 0) { disabledPlugins = []; }
        var extensionsAddByUse = Array.from(LogicFlow.extensions, function (_a) {
            var _b = __read(_a, 2), extension = _b[1];
            return extension;
        });
        // 安装插件，优先使用个性插件
        var extensions = __spreadArray(__spreadArray([], __read(this.plugins), false), __read(extensionsAddByUse), false);
        forEach(extensions, function (ext) {
            var extension;
            var props;
            if (pluginFlag in ext) {
                extension = ext.extension;
                props = ext.props;
            }
            else {
                extension = ext;
            }
            var pluginName = extension === null || extension === void 0 ? void 0 : extension.pluginName;
            if (indexOf(disabledPlugins, pluginName) === -1) {
                _this.installPlugin(extension, props);
            }
        });
    };
    /**
     * 加载插件-内部方法
     */
    LogicFlow.prototype.installPlugin = function (extension, props) {
        var _a, _b;
        if ('pluginName' in extension && 'install' in extension) {
            var pluginName_1 = extension.pluginName, install = extension.install, render_1 = extension.render;
            if (pluginName_1) {
                install && install.call(extension, this, LogicFlow);
                render_1 && this.components.push(render_1.bind(extension));
                this.extension[pluginName_1] = extension;
            }
            return;
        }
        var ExtensionCtor = extension;
        var pluginName = ExtensionCtor.pluginName;
        var extensionIns = new ExtensionCtor({
            lf: this,
            LogicFlow: LogicFlow,
            props: props,
            // TODO: 这里的 options 应该传入插件对应的 options，而不是全局的 options
            // 所以应该这么写 this.options.pluginsOptions[ExtensionCtor.pluginName] ?? {}
            options: (_b = (_a = this.options.pluginsOptions) === null || _a === void 0 ? void 0 : _a[pluginName]) !== null && _b !== void 0 ? _b : {},
        });
        extensionIns.render &&
            this.components.push(extensionIns.render.bind(extensionIns));
        this.extension[pluginName] = extensionIns;
    };
    /** 销毁当前实例 */
    LogicFlow.prototype.destroy = function () {
        var _a;
        this.clearData();
        render(null, this.container);
        this.keyboard.destroy();
        this.graphModel.destroy();
        this.tool.destroy();
        this.history.destroy();
        for (var extensionName in this.extension) {
            var extensionInstance = this.extension[extensionName];
            if ('destroy' in extensionInstance) {
                (_a = extensionInstance.destroy) === null || _a === void 0 ? void 0 : _a.call(extensionInstance);
            }
        }
    };
    // 全局配置的插件，所有的LogicFlow示例都会使用
    LogicFlow.extensions = new Map();
    return LogicFlow;
}());
export { LogicFlow };
// toStringTag
(function (LogicFlow) {
    LogicFlow.toStringTag = "LF.".concat(LogicFlow.name);
})(LogicFlow || (LogicFlow = {}));
export default LogicFlow;
