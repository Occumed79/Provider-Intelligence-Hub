import { BaseEdgeModel, BaseNodeModel, EditConfigModel, Model, TransformModel } from '.';
import { ElementState, EventType, OverlapMode, TextMode } from '../constant';
import LogicFlow from '../LogicFlow';
import { Options as LFOptions } from '../options';
import EventEmitter from '../event/eventEmitter';
import { Grid } from '../view/overlay';
import PointTuple = LogicFlow.PointTuple;
import GraphData = LogicFlow.GraphData;
import NodeConfig = LogicFlow.NodeConfig;
export declare class GraphModel {
    /**
     * LogicFlow画布挂载元素
     * 也就是初始化LogicFlow实例时传入的container
     */
    readonly rootEl: HTMLElement;
    readonly flowId?: string;
    width: number;
    height: number;
    theme: LogicFlow.Theme;
    themeMode: LogicFlow.ThemeMode | string;
    customStyles: LogicFlow.Theme;
    grid: Grid.GridOptions;
    readonly eventCenter: EventEmitter;
    readonly modelMap: Map<string, LogicFlow.GraphElementCtor>;
    /**
     * 位于当前画布顶部的元素
     * 此元素只在堆叠模式为默认模式下存在
     * 用于在默认模式下将之前的顶部元素回复初始高度
     */
    topElement?: BaseNodeModel | BaseEdgeModel;
    animation?: boolean | LFOptions.AnimationConfig;
    idGenerator?: (type?: string) => string | undefined;
    edgeGenerator: LFOptions.Definition['edgeGenerator'];
    customTargetAnchor?: LFOptions.Definition['customTargetAnchor'];
    nodeModelMap: Map<string, BaseNodeModel>;
    edgeModelMap: Map<string, BaseEdgeModel>;
    elementsModelMap: Map<string, BaseNodeModel | BaseEdgeModel>;
    /**
     * 节点移动规则判断
     * 在节点移动的时候，会触发此数组中的所有规则判断
     */
    nodeMoveRules: Model.NodeMoveRule[];
    /**
     * 节点resize规则判断
     * 在节点resize的时候，会触发此数组中的所有规则判断
     */
    nodeResizeRules: Model.NodeResizeRule[];
    /**
     * 获取自定义连线轨迹
     */
    customTrajectory: LFOptions.Definition['customTrajectory'];
    /**
     * 判断是否使用的是容器的宽度
     */
    isContainerWidth: boolean;
    /**
     * 判断是否使用的是容器的高度
     */
    isContainerHeight: boolean;
    edgeType: string;
    nodes: BaseNodeModel[];
    edges: BaseEdgeModel[];
    fakeNode?: BaseNodeModel | null;
    /**
     * 元素重合时堆叠模式：
     * - DEFAULT（默认模式）：节点和边被选中，会被显示在最上面。当取消选中后，元素会恢复之前的层级
     * - INCREASE（递增模式）：节点和边被选中，会被显示在最上面。当取消选中后，元素会保持当前层级
     */
    overlapMode: OverlapMode;
    background?: boolean | LFOptions.BackgroundConfig;
    gridSize: number;
    transformModel: TransformModel;
    editConfigModel: EditConfigModel;
    partial: boolean;
    [propName: string]: any;
    private waitCleanEffects;
    constructor(options: LFOptions.Common);
    get nodesMap(): GraphModel.NodesMapType;
    get edgesMap(): GraphModel.EdgesMapType;
    get modelsMap(): GraphModel.ModelsMapType;
    /**
     * 基于zIndex对元素进行排序。
     * todo: 性能优化
     */
    get sortElements(): (BaseNodeModel<LogicFlow.PropertiesType> | BaseEdgeModel<LogicFlow.PropertiesType>)[];
    /**
     * 当前编辑的元素，低频操作，先循环找。
     */
    get textEditElement(): BaseNodeModel<LogicFlow.PropertiesType> | BaseEdgeModel<LogicFlow.PropertiesType> | undefined;
    /**
     * 当前画布所有被选中的元素
     */
    get selectElements(): Map<string, BaseNodeModel<LogicFlow.PropertiesType> | BaseEdgeModel<LogicFlow.PropertiesType>>;
    get selectNodes(): BaseNodeModel<LogicFlow.PropertiesType>[];
    /**
     * 获取指定区域内的所有元素
     * @param leftTopPoint 表示区域左上角的点
     * @param rightBottomPoint 表示区域右下角的点
     * @param wholeEdge 是否要整个边都在区域内部
     * @param wholeNode 是否要整个节点都在区域内部
     * @param ignoreHideElement 是否忽略隐藏的节点
     */
    getAreaElement(leftTopPoint: PointTuple, rightBottomPoint: PointTuple, wholeEdge?: boolean, wholeNode?: boolean, ignoreHideElement?: boolean): LogicFlow.GraphElement[];
    /**
     * 获取指定类型元素对应的Model
     */
    getModel(type: string): LogicFlow.GraphElementCtor | undefined;
    /**
     * 基于Id获取节点的model
     */
    getNodeModelById(nodeId: string): BaseNodeModel | undefined;
    /**
     * 因为流程图所在的位置可以是页面任何地方
     * 当内部事件需要获取触发事件时，其相对于画布左上角的位置
     * 需要事件触发位置减去画布相对于client的位置
     */
    getPointByClient({ x: x1, y: y1, }: LogicFlow.Point): LogicFlow.ClientPosition;
    /**
     * 判断一个元素是否在指定矩形区域内。
     * @param element 节点或者边
     * @param lt 左上角点
     * @param rb 右下角点
     * @param wholeEdge 边的起点和终点都在区域内才算
     * @param wholeNode 节点的box都在区域内才算
     */
    isElementInArea(element: BaseEdgeModel | BaseNodeModel, lt: PointTuple, rb: PointTuple, wholeEdge?: boolean, wholeNode?: boolean): boolean;
    /**
     * 使用新的数据重新设置整个画布的元素
     * 注意：将会清除画布上所有已有的节点和边
     * @param { object } graphData 图数据
     */
    graphDataToModel(graphData: Partial<LogicFlow.GraphConfigData>): void;
    /**
     * 获取画布数据
     */
    modelToGraphData(): GraphData;
    modelToHistoryData(): GraphData | false;
    /**
     * 获取边的model
     */
    getEdgeModelById(edgeId: string): BaseEdgeModel | undefined;
    /**
     * 获取节点或者边的model
     */
    getElement(id: string): BaseNodeModel | BaseEdgeModel | undefined;
    /**
     * 所有节点上所有边的model
     */
    getNodeEdges(nodeId: string): BaseEdgeModel[];
    /**
     * 获取选中的元素数据
     * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的边,默认包括。
     * 复制的时候不能包括此类边, 因为复制的时候不允许悬空的边
     */
    getSelectElements(isIgnoreCheck?: boolean): GraphData;
    /**
     * 修改对应元素 model 中的属性
     * 注意：此方法慎用，除非您对logicflow内部有足够的了解。
     * 大多数情况下，请使用setProperties、updateText、changeNodeId等方法。
     * 例如直接使用此方法修改节点的id,那么就是会导致连接到此节点的边的sourceNodeId出现找不到的情况。
     * @param {string} id 元素id
     * @param {object} attributes 需要更新的属性
     */
    updateAttributes(id: string, attributes: object): void;
    /**
     * 修改节点的id， 如果不传新的id，会内部自动创建一个。
     * @param { string } nodeId 将要被修改的id
     * @param { string } newId 可选，修改后的id
     * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
     */
    changeNodeId(nodeId: string, newId?: string): string;
    /**
     * 修改边的id， 如果不传新的id，会内部自动创建一个。
     * @param { string } oldId 将要被修改的id
     * @param { string } newId 可选，修改后的id
     * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
     */
    changeEdgeId<T extends string>(oldId: string, newId?: string): T | string;
    /**
     * 获取元素的文本模式
     * @param model
     */
    getTextModel(model: BaseNodeModel): TextMode | undefined;
    /**
     * 内部保留方法，请勿直接使用
     */
    /**
     * 设置重叠模式
     * @param mode 重叠模式
     */
    setOverlapMode(mode: OverlapMode): void;
    /**
     * 更新元素的文本模式
     * @param mode
     * @param model
     */
    setTextMode(mode: TextMode, model?: BaseNodeModel | BaseEdgeModel): void;
    /**
     * 内部保留方法，请勿直接使用
     */
    setFakeNode(nodeModel: BaseNodeModel): void;
    /**
     * 内部保留方法，请勿直接使用
     */
    removeFakeNode(): void;
    /**
     * 设置指定类型的Model,请勿直接使用
     */
    setModel(type: string, ModelClass: LogicFlow.GraphElementCtor): Map<string, LogicFlow.GraphElementCtor>;
    /**
     * 将某个元素放置到顶部。
     * 如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。
     * 如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。
     * @see todo link 堆叠模式
     * @param id 元素Id
     */
    toFront(id: string): void;
    /**
     * 设置元素的zIndex.
     * 注意：默认堆叠模式下，不建议使用此方法。
     * @see todo link 堆叠模式
     * @param id 元素id
     * @param zIndex zIndex的值，可以传数字，也支持传入 'top' 和 'bottom'
     */
    setElementZIndex(id: string, zIndex: number | 'top' | 'bottom'): void;
    /**
     * 删除节点
     * @param {string} nodeId 节点Id
     */
    deleteNode(nodeId: string): void;
    /**
     * 添加节点
     * @param nodeConfig 节点配置
     * @param eventType 新增节点事件类型，默认EventType.NODE_ADD, 在Dnd拖拽时，会传入EventType.NODE_DND_ADD
     * @param event MouseEvent 鼠标事件
     */
    addNode(nodeConfig: NodeConfig, eventType?: EventType, event?: MouseEvent): BaseNodeModel<LogicFlow.PropertiesType>;
    /**
     * 将node节点位置进行grid修正
     * 同时处理node内文字的偏移量
     * 返回一个位置修正过的复制节点NodeModel
     * @param node
     */
    getModelAfterSnapToGrid(node: NodeConfig): BaseNodeModel<LogicFlow.PropertiesType>;
    /**
     * 克隆节点
     * @param nodeId 节点Id
     */
    cloneNode(nodeId: string): LogicFlow.NodeData | undefined;
    /**
     * 移动节点-相对位置
     * @param nodeId 节点Id
     * @param deltaX X轴移动距离
     * @param deltaY Y轴移动距离
     * @param isIgnoreRule 是否忽略移动规则限制
     */
    moveNode(nodeId: string, deltaX: number, deltaY: number, isIgnoreRule?: boolean): void;
    /**
     * 移动节点-绝对位置
     * @param nodeId 节点Id
     * @param x X轴目标位置
     * @param y Y轴目标位置
     * @param isIgnoreRule 是否忽略条件，默认为 false
     */
    moveNode2Coordinate(nodeId: string, x: number, y: number, isIgnoreRule?: boolean): void;
    /**
     * 显示节点、连线文本编辑框
     * @param id 节点 or 连线 id
     */
    editText(id: string): void;
    /**
     * 给两个节点之间添加一条边
     * @param {object} edgeConfig
     */
    addEdge(edgeConfig: LogicFlow.EdgeConfig): BaseEdgeModel;
    /**
     * 移动边，内部方法，请勿直接使用
     */
    moveEdge(nodeId: string, deltaX: number, deltaY: number): void;
    /**
     * 如果有文案了，当节点移动引起文案位置修改时，找出当前文案位置与最新边距离最短距离的点
     * 最大程度保持节点位置不变且在边上
     * @param edgeModel 边的数据管理类
     * @param x X轴移动距离
     * @param y Y轴移动距离
     */
    handleEdgeTextMove(edgeModel: BaseEdgeModel, x: number, y: number): void;
    /**
     * 删除两节点之间的边
     * @param sourceNodeId 边的起始节点
     * @param targetNodeId 边的目的节点
     */
    deleteEdgeBySourceAndTarget(sourceNodeId: string, targetNodeId: string): void;
    /**
     * 基于边Id删除边
     */
    deleteEdgeById(id: string): void;
    /**
     * 删除以节点Id为起点的所有边
     */
    deleteEdgeBySource(sourceNodeId: string): void;
    /**
     * 删除以节点Id为终点的所有边
     */
    deleteEdgeByTarget(targetNodeId: string): void;
    /**
     * 设置元素的状态，在需要保证整个画布上所有的元素只有一个元素拥有此状态时可以调用此方法。
     * 例如文本编辑、菜单显示等。
     * additionStateData: 传递的额外值，如菜单显示的时候，需要传递期望菜单显示的位置。
     */
    setElementStateById(id: string, state: ElementState, additionStateData?: Model.AdditionStateDataType): void;
    /**
     * 更新节点或边的文案
     * @param id 节点或者边id
     * @param value 文案内容
     */
    updateText(id: string, value: string): void;
    /**
     * 选中节点
     * @param id 节点Id
     * @param multiple 是否为多选，如果为多选，则不去掉原有已选择节点的选中状态
     */
    selectNodeById(id: string, multiple?: boolean): void;
    /**
     * 选中边
     * @param id 边Id
     * @param multiple 是否为多选，如果为多选，则不去掉原已选中边的状态
     */
    selectEdgeById(id: string, multiple?: boolean): void;
    /**
     * 将图形选中
     * @param id 选择元素ID
     * @param multiple 是否允许多选，如果为true，不会将上一个选中的元素重置
     */
    selectElementById(id: string, multiple?: boolean): void;
    deselectElementById(id: string): void;
    /**
     * 将所有选中的元素设置为非选中
     */
    clearSelectElements(): void;
    /**
     * 批量移动节点，节点移动的时候，会动态计算所有节点与未移动节点的边位置
     * 移动的节点之间的边会保持相对位置
     */
    moveNodes(nodeIds: string[], deltaX: number, deltaY: number, isIgnoreRule?: boolean): void;
    /**
     * 添加节点移动限制规则，在节点移动的时候触发。
     * 如果方法返回false, 则会阻止节点移动。
     * @param fn function
     * @example
     *
     * graphModel.addNodeMoveRules((nodeModel, x, y) => {
     *   if (nodeModel.properties.disabled) {
     *     return false
     *   }
     *   return true
     * })
     *
     */
    addNodeMoveRules(fn: Model.NodeMoveRule): void;
    addNodeResizeRules(fn: Model.NodeResizeRule): void;
    /**
     * 设置默认的边类型
     * 也就是设置在节点直接有用户手动绘制的连线类型。
     * @param type LFOptions.EdgeType
     */
    setDefaultEdgeType(type: LFOptions.EdgeType): void;
    /**
     * 修改指定节点类型
     * @param id 节点id
     * @param type 节点类型
     */
    changeNodeType(id: string, type: string): void;
    /**
     * 切换边的类型
     * @param id 边Id
     * @param type 边类型
     */
    changeEdgeType(id: string, type: LFOptions.EdgeType): void;
    /**
     * 获取所有以此节点为终点的边
     */
    getNodeIncomingEdge(nodeId: string): BaseEdgeModel<LogicFlow.PropertiesType>[];
    /**
     * 获取所有以此节点为起点的边
     */
    getNodeOutgoingEdge(nodeId: string): BaseEdgeModel<LogicFlow.PropertiesType>[];
    /**
     * 获取所有以此锚点为终点的边
     */
    getAnchorIncomingEdge(anchorId?: string): BaseEdgeModel<LogicFlow.PropertiesType>[];
    /**
     * 获取所有以此锚点为起点的边
     */
    getAnchorOutgoingEdge(anchorId?: string): BaseEdgeModel<LogicFlow.PropertiesType>[];
    /**
     * 获取节点连接到的所有起始节点
     */
    getNodeIncomingNode(nodeId?: string): BaseNodeModel<LogicFlow.PropertiesType>[];
    /**
     * 获取节点所有的下一级节点
     */
    getNodeOutgoingNode(nodeId?: string): BaseNodeModel<LogicFlow.PropertiesType>[];
    /**
     * 设置主题
     * todo docs link
     */
    setTheme(style: Partial<LogicFlow.Theme>, themeMode?: LogicFlow.ThemeMode | string): void;
    /**
     * 设置主题
     * todo docs link
     */
    getTheme(): {
        background: boolean | LFOptions.BackgroundConfig | undefined;
        grid: Grid.GridOptions;
        baseNode: LogicFlow.CommonTheme;
        baseEdge: LogicFlow.CommonTheme;
        rect: LogicFlow.CommonTheme;
        circle: LogicFlow.CommonTheme;
        diamond: LogicFlow.CommonTheme;
        ellipse: LogicFlow.CommonTheme;
        polygon: LogicFlow.CommonTheme;
        html: LogicFlow.CommonTheme;
        line: LogicFlow.CommonTheme;
        polyline: LogicFlow.CommonTheme;
        bezier: LogicFlow.EdgeBezierTheme;
        anchorLine: LogicFlow.AnchorLineTheme;
        text: LogicFlow.TextNodeTheme;
        nodeText: LogicFlow.NodeTextTheme;
        edgeText: LogicFlow.EdgeTextTheme;
        inputText?: LogicFlow.CommonTheme | undefined;
        anchor: LogicFlow.AnchorTheme;
        arrow: LogicFlow.ArrowTheme;
        snapline: LogicFlow.CommonTheme;
        rotateControl: LogicFlow.CommonTheme;
        resizeControl: LogicFlow.CommonTheme;
        resizeOutline: LogicFlow.CommonTheme;
        multiSelect?: {
            xPadding?: number | undefined;
            yPadding?: number | undefined;
        } | undefined;
        edgeAdjust: LogicFlow.CommonTheme;
        outline: LogicFlow.OutlineTheme;
        edgeOutline: LogicFlow.OutlineTheme;
        edgeAnimation: LogicFlow.EdgeAnimation;
    };
    /**
     * 更新网格配置
     */
    updateGridOptions(options: Partial<Grid.GridOptions>): void;
    /**
     * 更新网格尺寸
     */
    updateGridSize(size: number): void;
    /**
     * 更新背景配置
     */
    updateBackgroundOptions(options: boolean | Partial<LFOptions.BackgroundConfig>): void;
    /**
     * 重新设置画布的宽高
     */
    resize(width?: number, height?: number): void;
    /**
     * 清空画布
     */
    clearData(): void;
    /**
     * 获取图形区域虚拟矩形的尺寸和中心坐标
     * @returns
     */
    getVirtualRectSize(): GraphModel.VirtualRectProps;
    /**
     * 将图形整体移动到画布中心
     */
    translateCenter(): void;
    /**
     * 画布图形适应屏幕大小
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
    /**
     * 获取当前局部渲染模式
     * @returns boolean
     */
    getPartial(): boolean;
    /**
     * 设置是否开启局部渲染模式
     * @param partial boolean
     * @returns
     */
    setPartial(partial: boolean): void;
    /** 销毁当前实例 */
    destroy(): void;
}
export declare namespace GraphModel {
    type NodesMapType = Record<string, {
        index: number;
        model: BaseNodeModel;
    }>;
    type EdgesMapType = Record<string, {
        index: number;
        model: BaseEdgeModel;
    }>;
    type ModelsMapType = Record<string, BaseNodeModel | BaseEdgeModel>;
    type VirtualRectProps = {
        width: number;
        height: number;
        x: number;
        y: number;
    };
}
export default GraphModel;
