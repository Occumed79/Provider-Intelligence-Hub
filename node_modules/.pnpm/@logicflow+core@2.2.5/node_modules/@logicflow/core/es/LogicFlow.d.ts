import { ComponentType, createElement as h } from 'preact/compat';
import { Options as LFOptions } from './options';
import * as _Model from './model';
import { BaseEdgeModel, BaseNodeModel, IEditConfigType, GraphModel, SnaplineModel, ZoomParamType } from './model';
import { Dnd } from './view/behavior';
import Tool from './tool';
import History from './history';
import Keyboard from './keyboard';
import { EventCallback, CallbackArgs, EventArgs } from './event/eventEmitter';
import { EventType, OverlapMode, SegmentDirection } from './constant';
import { Grid } from './view/overlay';
import Extension = LogicFlow.Extension;
import ExtensionConfig = LogicFlow.ExtensionConfig;
import ExtensionConstructor = LogicFlow.ExtensionConstructor;
import GraphConfigData = LogicFlow.GraphConfigData;
import NodeConfig = LogicFlow.NodeConfig;
import EdgeConfig = LogicFlow.EdgeConfig;
import GraphData = LogicFlow.GraphData;
import NodeData = LogicFlow.NodeData;
import EdgeData = LogicFlow.EdgeData;
import RegisterConfig = LogicFlow.RegisterConfig;
import GraphElements = LogicFlow.GraphElements;
import Position = LogicFlow.Position;
import PointTuple = LogicFlow.PointTuple;
import ExtensionRenderFunc = LogicFlow.ExtensionRenderFunc;
import RegisterElementFunc = LogicFlow.RegisterElementFunc;
import PropertiesType = LogicFlow.PropertiesType;
import ClientPosition = LogicFlow.ClientPosition;
import ExtensionDefinition = LogicFlow.ExtensionDefinition;
import ExtensionType = LogicFlow.ExtensionType;
declare const pluginFlag: unique symbol;
export declare class LogicFlow {
    readonly container: HTMLElement;
    readonly options: LFOptions.Definition;
    readonly graphModel: GraphModel;
    viewMap: Map<string, ComponentType>;
    history: History;
    keyboard: Keyboard;
    dnd: Dnd;
    tool: Tool;
    snaplineModel?: SnaplineModel;
    components: ExtensionRenderFunc[];
    readonly plugins: ExtensionType[];
    static extensions: Map<string, ExtensionConfig>;
    extension: Record<string, Extension | ExtensionDefinition>;
    readonly width?: number;
    readonly height?: number;
    /**
     * 自定义数据转换方法
     * 当接入系统格式和 LogicFlow 数据格式不一致时，可自定义此方法来进行数据格式转换
     * 详情请参考 adapter docs
     * 包括 adapterIn 和 adapterOut 两个方法
     */
    adapterIn?: (data: unknown) => GraphData;
    adapterOut?: (data: GraphData, ...rest: any) => unknown;
    [propName: string]: any;
    private initContainer;
    protected get [Symbol.toStringTag](): string;
    constructor(options: LFOptions.Common);
    /*********************************************************
     * Register 相关
     ********************************************************/
    private setView;
    private getView;
    register(element: RegisterConfig): void;
    register(type: string, fn: RegisterElementFunc, isObserverView?: boolean): void;
    /**
     * 注册元素（节点 or 边）
     * @param config 注册元素的配置项
     * @private
     */
    private registerElement;
    /**
     * 批量注册元素
     * @param elements 注册的元素
     */
    batchRegister(elements?: RegisterConfig[]): void;
    private defaultRegister;
    /*********************************************************
     * Node 相关方法
     ********************************************************/
    /**
     * 添加节点
     * @param nodeConfig 节点配置
     * @param eventType 新增节点事件类型，默认EventType.NODE_ADD
     * @param e MouseEvent 事件
     */
    addNode(nodeConfig: NodeConfig, eventType?: EventType, e?: MouseEvent): BaseNodeModel;
    /**
     * 删除节点
     * @param {string} nodeId 节点Id
     */
    deleteNode(nodeId: string): boolean;
    /**
     * 克隆节点
     * @param nodeId 节点Id
     */
    cloneNode(nodeId: string): NodeData | undefined;
    /**
     * 修改节点的id，如果不传新的id，会内部自动创建一个。
     * @param { string } nodeId 将要被修改的id
     * @param { string } newId 可选，修改后的id
     * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
     */
    changeNodeId(nodeId: string, newId?: string): string;
    /**
     * 修改指定节点类型
     * @param nodeId 节点id
     * @param type 节点类型
     */
    changeNodeType(nodeId: string, type: string): void;
    /**
     * 获取节点对象
     * @param nodeId 节点Id
     */
    getNodeModelById(nodeId: string): BaseNodeModel | undefined;
    /**
     * 获取节点数据
     * @param nodeId 节点
     */
    getNodeDataById(nodeId: string): NodeData | undefined;
    /**
     * 获取所有以此节点为终点的边
     * @param { string } nodeId
     */
    getNodeIncomingEdge(nodeId: string): _Model.BaseEdgeModel<PropertiesType>[];
    /**
     * 获取所有以此节点为起点的边
     * @param {string} nodeId
     */
    getNodeOutgoingEdge(nodeId: string): _Model.BaseEdgeModel<PropertiesType>[];
    /**
     * 获取节点连接到的所有起始节点
     * @param {string} nodeId
     */
    getNodeIncomingNode(nodeId: string): _Model.BaseNodeModel<PropertiesType>[];
    /**
     * 获取节点连接到的所有目标节点
     * @param {string} nodeId
     */
    getNodeOutgoingNode(nodeId: string): _Model.BaseNodeModel<PropertiesType>[];
    /**
     * 内部保留方法
     * 创建一个fakeNode，用于dnd插件拖动节点进画布的时候使用。
     */
    createFakeNode(nodeConfig: NodeConfig): _Model.BaseNodeModel<PropertiesType> | null;
    /**
     * 内部保留方法
     * 移除fakeNode
     */
    removeFakeNode(): void;
    /**
     * 内部保留方法
     * 用于fakeNode显示对齐线
     */
    setNodeSnapLine(data: NodeData): void;
    /**
     * 内部保留方法
     * 用于fakeNode移除对齐线
     */
    removeNodeSnapLine(): void;
    /*********************************************************
     * Edge 相关方法
     ********************************************************/
    /**
     * 设置默认的边类型。
     * 也就是设置在节点直接由用户手动绘制的连线类型。
     * @param type LFOptions.EdgeType
     */
    setDefaultEdgeType(type: LFOptions.EdgeType): void;
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
    addEdge(edgeConfig: EdgeConfig): BaseEdgeModel;
    /**
     * 基于id获取边数据
     * @param edgeId 边Id
     * @returns EdgeData
     */
    getEdgeDataById(edgeId: string): EdgeData | undefined;
    /**
     * 基于边Id获取边的model
     * @param edgeId 边的Id
     * @return model
     */
    getEdgeModelById(edgeId: string): BaseEdgeModel | undefined;
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
    getEdgeModels({ sourceNodeId, targetNodeId, }: {
        sourceNodeId?: string;
        targetNodeId?: string;
    }): BaseEdgeModel[];
    /**
     * 修改边的id， 如果不传新的id，会内部自动创建一个。
     * @param { string } edgeId 将要被修改的id
     * @param { string } newId 可选，修改后的id
     * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
     */
    changeEdgeId(edgeId: string, newId?: string): string;
    /**
     * 切换边的类型
     * @param edgeId 边Id
     * @param type 边类型
     */
    changeEdgeType(edgeId: string, type: LFOptions.EdgeType): void;
    /**
     * 删除边
     * @param {string} edgeId 边Id
     */
    deleteEdge(edgeId: string): boolean;
    /**
     * 基于给定节点（作为边起点或终点，可以只传其一），删除对应的边
     * @param sourceNodeId 边的起点节点ID
     * @param targetNodeId 边的终点节点ID
     */
    deleteEdgeByNodeId({ sourceNodeId, targetNodeId, }: {
        sourceNodeId?: string;
        targetNodeId?: string;
    }): void;
    /**
     * 获取节点连接的所有边的model
     * @param nodeId 节点ID
     * @returns model数组
     */
    getNodeEdges(nodeId: string): BaseEdgeModel[];
    /*********************************************************
     * Element 相关方法
     ********************************************************/
    /**
     * 添加多个元素, 包括边和节点。
     * @param nodes
     * @param edges
     * @param distance
     */
    addElements({ nodes, edges }: GraphConfigData, distance?: number): GraphElements;
    /**
     * 将图形选中
     * @param id 选择元素ID
     * @param multiple 是否允许多选，如果为true，不会将上一个选中的元素重置
     * @param toFront 是否将选中的元素置顶，默认为true
     */
    selectElementById(id: string, multiple?: boolean, toFront?: boolean): void;
    /**
     * 移除选中的元素
     * @param id 元素ID
     */
    deselectElementById(id: string): void;
    /**
     * 获取选中的元素数据
     * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的边,默认包括。
     * 注意：复制的时候不能包括此类边, 因为复制的时候不允许悬空的边。
     */
    getSelectElements(isIgnoreCheck?: boolean): GraphData;
    /**
     * 将所有选中的元素设置为非选中
     */
    clearSelectElements(): void;
    /**
     * 获取节点或边对象
     * @param id id
     */
    getModelById(id: string): LogicFlow.GraphElement | undefined;
    /**
     * 获取节点或边的数据
     * @param id id
     */
    getDataById(id: string): NodeData | EdgeData | undefined;
    /**
     * 删除元素，在不确定当前id是节点还是边时使用
     * @param id 元素id
     */
    deleteElement(id: string): boolean;
    /**
     * 设置元素的zIndex.
     * 注意：默认堆叠模式下，不建议使用此方法。
     * @see todo link 堆叠模式
     * @param id 元素id
     * @param zIndex zIndex的值，可以传数字，也支持传入 'top' 和 'bottom'
     */
    setElementZIndex(id: string, zIndex: number | 'top' | 'bottom'): void;
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
    getAreaElement(leftTopPoint: PointTuple, rightBottomPoint: PointTuple, wholeEdge?: boolean, wholeNode?: boolean, ignoreHideElement?: boolean): (EdgeData | NodeData)[];
    /**
     * 设置元素的自定义属性
     * @see http://logicflow.cn/api/detail#setproperties
     * @param id 元素的id
     * @param properties 自定义属性
     */
    setProperties(id: string, properties: PropertiesType): void;
    /**
     * 获取元素的自定义属性
     * @param id 元素的id
     * @returns 自定义属性
     */
    getProperties(id: string): PropertiesType | undefined;
    deleteProperty(id: string, key: string): void;
    /**
     * FBI WARNING !!! 慎用 === 不要用
     * 修改对应元素 model 中的属性
     * 注意：此方法慎用，除非您对logicflow内部有足够的了解。
     * 大多数情况下，请使用setProperties、updateText、changeNodeId等方法。
     * 例如直接使用此方法修改节点的id,那么就是会导致连接到此节点的边的sourceNodeId出现找不到的情况。
     * @param {string} id 元素id
     * @param {object} attributes 需要更新的属性
     */
    updateAttributes(id: string, attributes: object): void;
    /*********************************************************
     * Text 相关方法
     ********************************************************/
    /**
     * 显示节点、连线文本编辑框
     * @param id 元素id
     */
    editText(id: string): void;
    /**
     * 更新节点或边的文案
     * @param id 节点或者边id
     * @param value 文案内容
     */
    updateText(id: string, value: string): void;
    /*********************************************************
     * EditConfig 相关方法
     ********************************************************/
    /**
     * 更新流程图编辑相关设置
     * @param {object} config 编辑配置
     * @see http://logicflow.cn/api/detail#updateeditconfig
     */
    updateEditConfig(config: Partial<IEditConfigType>): void;
    /**
     * 获取流程图当前编辑相关设置
     * @see http://logicflow.cn/api/detail#geteditconfig
     */
    getEditConfig(): _Model.IEditConfigType;
    /*********************************************************
     * Graph 相关方法
     ********************************************************/
    /**
     * 设置主题样式
     * @param { object } style 自定义主题样式
     * todo docs link
     */
    setTheme(style: Partial<LogicFlow.Theme>, themeMode?: 'radius' | 'dark' | 'colorful' | 'default' | string): void;
    /**
     * 获取当前主题样式
     * @see todo docs link
     */
    getTheme(): LogicFlow.Theme;
    private focusByElement;
    private focusByCoordinate;
    /**
     * 定位到画布视口中心
     * 支持用户传入图形当前的坐标或id，可以通过type来区分是节点还是边的id，也可以不传（兜底）
     * @param focusOnArgs.id 如果传入的是id, 则画布视口中心移动到此id的元素中心点。
     * @param focusOnArgs.coordinate 如果传入的是坐标，则画布视口中心移动到此坐标。
     * TODO: 测试下面代码，重构了一下逻辑，重载 api 定义
     */
    focusOn(id: string): void;
    focusOn(coordinate: Position): void;
    focusOn(focusOnArgs: LogicFlow.FocusOnArgsType): void;
    /**
     * 重新设置画布的宽高
     * 不传会自动计算画布宽高
     */
    resize(width?: number, height?: number): void;
    /**
     * 将某个元素放置到顶部。
     * 如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。
     * 如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。
     * @see todo link 堆叠模式
     * @param id 元素Id
     */
    toFront(id: string): void;
    /**
     * 获取事件位置相对于画布左上角的坐标
     * 画布所在的位置可以是页面任何地方，原生事件返回的坐标是相对于页面左上角的，该方法可以提供以画布左上角为原点的准确位置。
     * @param {number} x
     * @param {number} y
     * @returns {object} Point 事件位置的坐标
     * @returns {object} Point.domOverlayPosition HTML层上的坐标
     * @returns {object} Point.canvasOverlayPosition SVG层上的坐标
     */
    getPointByClient(x: number, y: number): ClientPosition;
    getPointByClient(point: Position): ClientPosition;
    /**
     * 获取流程绘图数据
     * 注意: getGraphData返回的数据受到adapter影响，所以其数据格式不一定是logicflow内部图数据格式。
     * 如果实现通用插件，请使用getGraphRawData
     */
    getGraphData(...params: any): GraphData | unknown;
    /**
     * 获取流程绘图原始数据
     * 在存在adapter时，可以使用getGraphRawData获取图原始数据
     */
    getGraphRawData(): GraphData;
    /**
     * 清空画布
     */
    clearData(): void;
    setOverlapMode(mode: OverlapMode): void;
    /*********************************************************
     * LogicFlow Render方法
     ********************************************************/
    renderRawData(graphRawData: GraphConfigData): void;
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
    render(graphData: GraphConfigData): void;
    /*********************************************************
     * History/Resize 相关方法
     ********************************************************/
    /**
     * 历史记录操作
     * 返回上一步
     */
    undo(): void;
    /**
     * 历史记录操作
     * 恢复下一步
     */
    redo(): void;
    /**
     * 放大缩小图形
     * @param zoomSize 放大缩小的值，支持传入0-n之间的数字。小于1表示缩小，大于1表示放大。也支持传入true和false按照内置的刻度放大缩小
     * @param point 缩放的原点
     * @returns {string} -放大缩小的比例
     */
    zoom(zoomSize?: ZoomParamType, point?: PointTuple): string;
    /**
     * 重置图形的放大缩写比例为默认
     */
    resetZoom(): void;
    /**
     * 设置图形缩小时，能缩放到的最小倍数。参数为0-1自己。默认0.2
     * @param size 图形缩小的最小值
     */
    setZoomMiniSize(size: number): void;
    /**
     * 设置图形放大时，能放大到的最大倍数，默认16
     * @param size 图形放大的最大值
     */
    setZoomMaxSize(size: number): void;
    /**
     * 获取缩放的值和平移的值。
     */
    getTransform(): {
        SCALE_X: number;
        SCALE_Y: number;
        TRANSLATE_X: number;
        TRANSLATE_Y: number;
    };
    /**
     * 平移图
     * @param x 向x轴移动距离
     * @param y 向y轴移动距离
     */
    translate(x: number, y: number): void;
    /**
     * 还原图形为初始位置
     */
    resetTranslate(): void;
    /**
     * 图形画布居中显示
     */
    translateCenter(): void;
    /**
     * 图形适应屏幕大小
     * @param verticalOffset number 距离盒子上下的距离， 默认为20
     * @param horizontalOffset number 距离盒子左右的距离， 默认为20
     */
    fitView(verticalOffset?: number, horizontalOffset?: number): void;
    /**
     * 开启边的动画
     * @param edgeId string
     */
    openEdgeAnimation(edgeId: string): void;
    /**
     * 关闭边的动画
     * @param edgeId string
     */
    closeEdgeAnimation(edgeId: string): void;
    /*********************************************************
     * 事件系统方法
     ********************************************************/
    /**
     * 监听事件
     * 事件详情见 @see todo
     * 支持同时监听多个事件
     * @example
     * lf.on('node:click,node:contextmenu', (data) => {
     * });
     */
    on<T extends keyof EventArgs>(evt: T, callback: EventCallback<T>): void;
    on<T extends string>(evt: T, callback: EventCallback<T>): void;
    /**
     * 撤销监听事件
     */
    off<T extends keyof EventArgs>(evt: T, callback: EventCallback<T>): void;
    off<T extends string>(evt: T, callback: EventCallback<T>): void;
    /**
     * 监听事件，只监听一次
     */
    once<T extends keyof EventArgs>(evt: T, callback: EventCallback<T>): void;
    once<T extends string>(evt: T, callback: EventCallback<T>): void;
    /**
     * 触发监听事件
     */
    emit<T extends keyof EventArgs>(evts: T, eventArgs: CallbackArgs<T>): void;
    emit<T extends string>(evts: T, eventArgs: CallbackArgs<T>): void;
    /*********************************************************
     * 插件系统方法
     ********************************************************/
    /**
     * 添加扩展, 待讨论，这里是不是静态方法好一些？
     * 重复添加插件的时候，把上一次添加的插件的销毁。
     * @param extension
     * @param props
     */
    static use(extension: ExtensionConstructor | ExtensionDefinition, props?: Record<string, unknown>): void;
    /**
     * 添加主题模式
     * @param themeMode 主题模式
     * @param style 主题样式
     */
    static addThemeMode(themeMode: string, style: Partial<LogicFlow.Theme>): void;
    static removeThemeMode(themeMode: string): void;
    static clearThemeMode(): void;
    private installPlugins;
    /**
     * 加载插件-内部方法
     */
    private installPlugin;
    /** 销毁当前实例 */
    destroy(): void;
}
export declare namespace LogicFlow {
    /**
     * LogicFlow init Options
     */
    interface Options extends LFOptions.Common {
    }
    type DomAttributes = {
        className?: string;
        [key: string]: string | undefined;
    };
    interface PropertiesType {
        width?: number;
        height?: number;
        rx?: number;
        ry?: number;
        style?: LogicFlow.CommonTheme;
        textStyle?: LogicFlow.CommonTheme;
        [key: string]: any;
    }
    type AttributesType = Record<string, any>;
    type VectorData = {
        deltaX: number;
        deltaY: number;
    };
    type OffsetData = {
        dx: number;
        dy: number;
    };
    type Position = {
        x: number;
        y: number;
    };
    type Point = {
        id?: string;
        [key: string]: any;
    } & Position;
    type PointTuple = [number, number];
    type ClientPosition = {
        domOverlayPosition: Position;
        canvasOverlayPosition: Position;
    };
    interface LineSegment {
        start: Point;
        end: Point;
    }
    type Direction = SegmentDirection;
    type RadiusCircleInfo = {
        r: number;
    } & Position;
    type Vector = {
        id?: string;
        x: number;
        y: number;
        z: 0;
        [key: string]: any;
    };
    type RectSize = {
        width: number;
        height: number;
    };
    type TextConfig = {
        value: string;
        x: number;
        y: number;
        editable?: boolean;
        draggable?: boolean;
    };
    type LabelConfig = {
        id?: string;
        type?: string;
        x: number;
        y: number;
        content?: string;
        value: string;
        rotate?: number;
        style?: h.JSX.CSSProperties;
        editable?: boolean;
        draggable?: boolean;
        labelWidth?: number;
        textOverflowMode?: 'ellipsis' | 'wrap' | 'clip' | 'nowrap' | 'default';
        vertical?: boolean;
    };
    type LabelOption = {
        isVertical: boolean;
        isMultiple: boolean;
        maxCount?: number;
    };
    interface LabelData extends LabelConfig {
        id: string;
        x: number;
        y: number;
        content: string;
        value: string;
    }
    type AppendConfig = {
        startIndex: number;
        endIndex: number;
        direction: Direction;
        draggable?: boolean;
    } & LineSegment;
    type ArrowConfig = {
        markerStart: string;
        markerEnd: string;
    };
    type ArrowInfo = {
        start: Point;
        end: Point;
        hover: boolean;
        isSelected: boolean;
    };
    interface GraphConfigData {
        nodes?: NodeConfig[];
        edges?: EdgeConfig[];
    }
    interface GraphData {
        nodes: NodeData[];
        edges: EdgeData[];
    }
    interface FakeNodeConfig {
        type: string;
        text?: TextConfig | string;
        properties?: PropertiesType;
        [key: string]: unknown;
    }
    type OnDragNodeConfig = {
        type: string;
        text?: TextConfig | string;
        properties?: Record<string, unknown>;
        [key: string]: any;
    };
    interface NodeConfig<P extends PropertiesType = PropertiesType> {
        id?: string;
        type: string;
        x: number;
        y: number;
        text?: TextConfig | string;
        zIndex?: number;
        properties?: P;
        virtual?: boolean;
        rotate?: number;
        rotatable?: boolean;
        resizable?: boolean;
        [key: string]: any;
    }
    interface NodeData extends NodeConfig {
        id: string;
        text?: TextConfig;
        [key: string]: unknown;
    }
    interface EdgeConfig<P extends PropertiesType = PropertiesType> {
        id?: string;
        type?: string;
        sourceNodeId: string;
        sourceAnchorId?: string;
        targetNodeId: string;
        targetAnchorId?: string;
        startPoint?: Point;
        endPoint?: Point;
        text?: TextConfig | string;
        pointsList?: Point[];
        zIndex?: number;
        properties?: P;
    }
    interface EdgeData extends EdgeConfig {
        id: string;
        type: string;
        text?: TextConfig;
        startPoint: Point;
        endPoint: Point;
        [key: string]: unknown;
    }
    interface MenuConfig {
        text?: string;
        className?: string;
        icon?: boolean;
        callback: (id: string | number) => void;
    }
}
export declare namespace LogicFlow {
    type NumberOrPercent = `${number}%` | number;
    /**
     * 颜色 - CSS 属性用颜色
     * 如：#000000, rgba(0, 0, 0, 0), 如果是透明的，可以传 'none'
     */
    type Color = string | 'none';
    /**
     * svg虚线
     * 格式为逗号分割字符串，如
     * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-dasharray
     */
    type DashArray = string;
    type CommonTheme = {
        fill?: Color;
        stroke?: Color;
        strokeWidth?: number;
        /**
         * 其他属性 - 我们会把你自定义的所有属性最终传递到 DOM 上
         * 详情请参考 svg 属性规范：
         * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute
         * 注意: 请不要在主题中设置“形状属性”，例如：x、y、width、height、radius、r、rx、ry
         * @see https://docs.logic-flow.cn/docs/#/zh/api/themeApi?id=%e5%bd%a2%e7%8a%b6%e5%b1%9e%e6%80%a7）
         */
        radius?: number;
        rx?: number;
        ry?: number;
        width?: number;
        height?: number;
        path?: string;
        [key: string]: unknown;
    };
    type CommonThemePropTypes = CommonTheme[keyof CommonTheme];
    type AppendAttributes = {
        d: string;
        fill: string;
        stroke: Color;
        strokeWidth: number;
        strokeDasharray: DashArray;
    };
    type ContainerTheme = {
        width?: string;
        height?: string;
    };
    /**
     * rect 节点主题
     * svg基础图形-矩形
     * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/rect
     */
    type RectTheme = CommonTheme;
    /**
     * circle 节点主题
     * svg基础图形-圆形
     * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/circle
     */
    type CircleTheme = CommonTheme;
    /**
     * polygon 节点主题
     * svg基础图形-多边形
     * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polygon
     */
    type PolygonTheme = CommonTheme;
    /**
     * ellipse 节点主题
     * svg基础图形-椭圆
     * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/ellipse
     */
    type EllipseTheme = CommonTheme;
    type AnchorTheme = {
        r?: number;
        hover?: {
            r?: number;
        } & CommonTheme;
    } & CommonTheme;
    type TextTheme = {
        color?: Color;
        fontSize: number;
        textWidth?: number;
        lineHeight?: number;
        textAnchor?: 'start' | 'middle' | 'end';
        dominantBaseline?: 'auto' | 'text-bottom' | 'alphabetic' | 'ideographic' | 'middle' | 'central' | 'mathematical' | 'hanging' | 'text-top';
    } & CommonTheme;
    type TextNodeTheme = {
        background?: RectTheme;
    } & TextTheme;
    type NodeTextTheme = {
        /**
         * 文本超出指定宽度处理方式
         * default: 不特殊处理，允许超出
         * autoWrap: 超出自动换行
         * ellipsis: 超出省略
         */
        overflowMode?: 'default' | 'autoWrap' | 'ellipsis';
        textWidth?: number;
        background?: RectTheme;
        /**
         * 背景区域 padding
         * wrapPadding: '5px,10px'
         */
        wrapPadding?: string;
    } & TextTheme;
    type EdgeTextTheme = {
        textWidth: number;
        background?: {
            /**
             * 背景区域 padding
             * wrapPadding: '5px,10px'
             */
            wrapPadding?: string;
        } & RectTheme;
        hover?: EdgeTextTheme;
    } & NodeTextTheme & TextTheme;
    type EdgeTheme = CommonTheme;
    type EdgeBezierTheme = {
        adjustLine?: EdgeTheme;
        adjustAnchor?: CircleTheme;
    } & EdgeTheme;
    type EdgePolylineTheme = EdgeTheme;
    type EdgeAnimation = {
        stroke?: Color;
        strokeDasharray?: string;
        strokeDashoffset?: NumberOrPercent;
        animationName?: string;
        animationDuration?: `${number}s` | `${number}ms`;
        animationIterationCount?: 'infinite' | number;
        animationTimingFunction?: string;
        animationDirection?: string;
    };
    type OutlineTheme = {
        hover?: CommonTheme;
        widthOffset?: number;
        heightOffset?: number;
    } & CommonTheme & EdgeAnimation;
    type ArrowTheme = {
        /**
         * 箭头长度.
         * 以符号"->"为例, offset表示箭头大于号的宽度。
         */
        offset: number;
        /**
         * 箭头垂直于边的距离
         * 以符号"->"为例, verticalLength表示箭头大于号的高度
         */
        refX?: number;
        refY?: number;
        verticalLength: number;
        endArrowType?: 'solid' | 'hollow' | 'diamond' | 'circle' | 'none';
        startArrowType?: 'solid' | 'hollow' | 'diamond' | 'circle' | 'none';
        strokeLinecap?: 'butt' | 'round' | 'square';
        strokeLinejoin?: 'miter' | 'round' | 'bevel';
    } & CommonTheme;
    type ArrowAttributesType = {
        d: string;
    } & ArrowTheme;
    type AnchorLineTheme = EdgeTheme & EdgeAnimation;
    interface Theme {
        baseNode: CommonTheme;
        baseEdge: EdgeTheme;
        /**
         * 基础图形节点相关主题
         */
        rect: RectTheme;
        circle: CircleTheme;
        diamond: PolygonTheme;
        ellipse: EllipseTheme;
        polygon: PolygonTheme;
        html: RectTheme;
        /**
         * 基础图形线相关主题
         */
        line: EdgeTheme;
        polyline: EdgePolylineTheme;
        bezier: EdgeBezierTheme;
        anchorLine: AnchorLineTheme;
        /**
         * 文本内容相关主题
         */
        text: TextNodeTheme;
        nodeText: NodeTextTheme;
        edgeText: EdgeTextTheme;
        inputText?: CommonTheme;
        /**
         * 其他元素相关主题
         */
        anchor: AnchorTheme;
        arrow: ArrowTheme;
        snapline: EdgeTheme;
        rotateControl: CommonTheme;
        resizeControl: CommonTheme;
        resizeOutline: CommonTheme;
        multiSelect?: {
            xPadding?: number;
            yPadding?: number;
        };
        /**
         * REMIND: 当开启了跳转边的起点和终点(adjustEdgeStartAndEnd:true)后
         * 边的两端会出现调整按钮
         * 边连段的调整点样式
         */
        edgeAdjust: CircleTheme;
        outline: OutlineTheme;
        edgeOutline: OutlineTheme;
        edgeAnimation: EdgeAnimation;
        background?: boolean | Partial<LFOptions.BackgroundConfig>;
        grid?: boolean | Partial<Grid.GridOptions>;
    }
    type ThemeMode = 'default' | 'retro' | 'dark' | 'colorful';
}
export declare namespace LogicFlow {
    type FocusOnById = {
        id: string;
        coordinate?: never;
    };
    type FocusOnByCoordinate = {
        id?: string;
        coordinate: Position;
    };
    export type FocusOnArgsType = FocusOnById | FocusOnByCoordinate;
    export type BaseNodeModelCtor = typeof BaseNodeModel<PropertiesType>;
    export type BaseEdgeModelCtor = typeof BaseEdgeModel<PropertiesType>;
    export type GraphElementCtor = BaseNodeModelCtor | BaseEdgeModelCtor;
    export type GraphElement = BaseNodeModel | BaseEdgeModel;
    export type GraphElements = {
        nodes: BaseNodeModel[];
        edges: BaseEdgeModel[];
    };
    export type RegisterConfig = {
        type: string;
        view: ComponentType<any> & {
            isObserved?: boolean;
        };
        model: GraphElementCtor;
        isObserverView?: boolean;
    };
    export type RegisterElement = {
        view: any;
        model: any;
    };
    export type RegisterParam = {
        h: typeof h;
        [key: string]: unknown;
    };
    export type RegisterElementFunc = (params: RegisterParam) => RegisterElement;
    export interface LogicFlowConstructor {
        new (options: LFOptions.Definition): LogicFlow;
    }
    /**
     * Extension 插件类型
     */
    export type ExtensionType = ExtensionConstructor | ExtensionDefinition;
    export type ExtensionConfig = {
        [pluginFlag]: symbol;
        extension: ExtensionType;
        props?: Record<string, any>;
    };
    export type IExtensionProps = {
        lf: LogicFlow;
        LogicFlow: LogicFlowConstructor;
        props?: Record<string, unknown>;
        options: Record<string, unknown>;
    };
    export interface ExtensionConstructor {
        pluginName: string;
        new (props: IExtensionProps): Extension;
    }
    export type ExtensionRenderFunc = (lf: LogicFlow, container: HTMLElement) => void;
    export type ExtensionDefinition = {
        pluginName: string;
        install?: (lf: LogicFlow, LFCtor: LogicFlowConstructor) => void;
        render?: ExtensionRenderFunc;
    };
    export interface Extension {
        render: ExtensionRenderFunc;
        destroy?: () => void;
    }
    export {};
}
export declare namespace LogicFlow {
    const toStringTag: string;
}
export default LogicFlow;
