import { BaseNodeModel, GraphModel, Model } from '..';
import LogicFlow from '../../LogicFlow';
import { ElementState, ElementType, ModelType, OverlapMode, TextMode } from '../../constant';
import Point = LogicFlow.Point;
import EdgeData = LogicFlow.EdgeData;
import EdgeConfig = LogicFlow.EdgeConfig;
import TextConfig = LogicFlow.TextConfig;
import PropertiesType = LogicFlow.PropertiesType;
export interface IBaseEdgeModel<P extends PropertiesType> extends Model.BaseModel<P> {
    /**
     * model 基础类型，固定为 edge
     */
    readonly BaseType: ElementType.EDGE;
    properties: P;
    sourceNodeId: string;
    targetNodeId: string;
    startPoint?: Point;
    endPoint?: Point;
    points: string;
    pointsList: Point[];
    isAnimation: boolean;
    isDragging?: boolean;
    isShowAdjustPoint: boolean;
    sourceAnchorId?: string;
    targetAnchorId?: string;
    arrowConfig?: LogicFlow.ArrowConfig;
}
export declare class BaseEdgeModel<P extends PropertiesType = PropertiesType> implements IBaseEdgeModel<P> {
    readonly BaseType = ElementType.EDGE;
    static BaseType: ElementType;
    id: string;
    type: string;
    sourceNodeId: string;
    targetNodeId: string;
    startPoint: Point;
    endPoint: Point;
    textMode: TextMode;
    text: Required<TextConfig>;
    properties: P;
    points: string;
    pointsList: Point[];
    virtual: boolean;
    isSelected: boolean;
    isHovered: boolean;
    isHitable: boolean;
    isHittable: boolean;
    draggable: boolean;
    visible: boolean;
    isAnimation: boolean;
    isShowAdjustPoint: boolean;
    isDragging?: boolean;
    graphModel: GraphModel;
    zIndex: number;
    state: ElementState;
    modelType: ModelType;
    additionStateData?: Model.AdditionStateDataType;
    sourceAnchorId?: string;
    targetAnchorId?: string;
    menu?: LogicFlow.MenuConfig[];
    customTextPosition: boolean;
    style: LogicFlow.CommonTheme;
    arrowConfig: LogicFlow.ArrowConfig;
    [propName: string]: unknown;
    constructor(data: EdgeConfig<P>, graphModel: GraphModel);
    /**
     * 初始化边数据
     * @overridable 支持重写
     * initNodeData和setAttributes的区别在于
     * initNodeData只在节点初始化的时候调用，用于初始化节点的所有属性。
     * setAttributes除了初始化调用外，还会在properties发生变化后调用。
     */
    initEdgeData(data: EdgeConfig): void;
    /**
     * 设置model属性
     * @overridable 支持重写
     * 每次properties发生变化会触发
     */
    setAttributes(): void;
    createId(): string | null;
    /**
     * 自定义边样式
     *
     * @overridable 支持重写
     * @returns 自定义边样式
     */
    getEdgeStyle(): LogicFlow.EdgeTheme;
    /**
     * 自定义边调整点样式
     *
     * @overridable 支持重写
     * 在isShowAdjustPoint为true时会显示调整点。
     */
    getAdjustPointStyle(): {
        [x: string]: unknown;
        fill?: string | undefined;
        stroke?: string | undefined;
        strokeWidth?: number | undefined;
        radius?: number | undefined;
        rx?: number | undefined;
        ry?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        path?: string | undefined;
    };
    /**
     * 自定义边文本样式
     *
     * @overridable 支持重写
     */
    getTextStyle(): LogicFlow.EdgeTextTheme;
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
    getEdgeAnimationStyle(): LogicFlow.EdgeAnimation;
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
    getArrowStyle(): LogicFlow.ArrowTheme;
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
    getOutlineStyle(): LogicFlow.OutlineTheme;
    /**
     * 重新自定义文本位置
     *
     * @overridable 支持重写
     */
    getTextPosition(): Point;
    /**
     * 边的前一个节点
     */
    get sourceNode(): BaseNodeModel<LogicFlow.PropertiesType>;
    /**
     * 边的后一个节点
     */
    get targetNode(): BaseNodeModel<LogicFlow.PropertiesType>;
    get textPosition(): Point;
    /**
     * 内部方法，计算两个节点相连时的起点位置
     */
    getBeginAnchor(sourceNode: BaseNodeModel, targetNode: BaseNodeModel, sourceAnchorId?: string): Point | undefined;
    /**
     * 内部方法，计算两个节点相连时的终点位置
     */
    getEndAnchor(targetNode: BaseNodeModel, targetAnchorId?: string): Point | undefined;
    /**
     * 获取当前边的properties
     */
    getProperties(): P;
    /**
     * 获取被保存时返回的数据
     *
     * @overridable 支持重写
     */
    getData(): EdgeData;
    /**
     * 获取边的数据
     *
     * @overridable 支持重写
     * 用于在历史记录时获取节点数据。
     * 在某些情况下，如果希望某个属性变化不引起history的变化，
     * 可以重写此方法。
     */
    getHistoryData(): EdgeData;
    /**
     * 设置边的属性，会触发重新渲染
     * @param key 属性名
     * @param val 属性值
     */
    setProperty(key: string, val: any): void;
    /**
     * 删除边的属性，会触发重新渲染
     * @param key 属性名
     */
    deleteProperty(key: string): void;
    /**
     * 设置边的属性，会触发重新渲染
     * @param properties 要更新的 properties，会做合并
     */
    setProperties(properties: Record<string, any>): void;
    /**
     * 修改边的id
     */
    changeEdgeId(id: string): void;
    /**
     * 设置边样式，用于插件开发时跳过自定义边的渲染。大多数情况下，不需要使用此方法。
     * 如果需要设置边的样式，请使用 getEdgeStyle 方法自定义边样式。
     */
    setStyle(key: string, val: any): void;
    /**
     * 设置边样式，用于插件开发时跳过自定义边的渲染。大多数情况下，不需要使用此方法。
     * 如果需要设置边的样式，请使用 getEdgeStyle 方法自定义边样式。
     */
    setStyles(styles: any): void;
    /**
     * 设置边样式，用于插件开发时跳过自定义边的渲染。大多数情况下，不需要使用此方法。
     * 如果需要设置边的样式，请使用 getEdgeStyle 方法自定义边样式。
     */
    updateStyles(styles: any): void;
    /**
     * 设置当前元素的文本模式
     * @param mode
     */
    setTextMode(mode: TextMode): void;
    /**
     * 内部方法，处理初始化文本格式
     */
    formatText(data: EdgeConfig): void;
    /**
     * 重置文本位置
     */
    resetTextPosition(): void;
    /**
     * 移动边上的文本
     */
    moveText(deltaX: number, deltaY: number): void;
    /**
     * 设置文本位置和值
     */
    setText(textConfig: LogicFlow.TextConfig): void;
    /**
     * 更新文本的值
     */
    updateText(value: string): void;
    /**
     * 内部方法，计算边的起点和终点和其对于的锚点Id
     */
    setAnchors(): void;
    setSelected(flag?: boolean): void;
    setHovered(flag?: boolean): void;
    setHitable(flag?: boolean): void;
    setHittable(flag?: boolean): void;
    openEdgeAnimation(): void;
    closeEdgeAnimation(): void;
    setElementState(state: ElementState, additionStateData?: Model.AdditionStateDataType): void;
    updateStartPoint(anchor: Point): void;
    moveStartPoint(deltaX: number, deltaY: number): void;
    updateEndPoint(anchor: Point): void;
    moveEndPoint(deltaX: number, deltaY: number): void;
    setZIndex(zIndex?: number): void;
    initPoints(): void;
    updateAttributes(attributes: any): void;
    getAdjustStart(): LogicFlow.Point;
    getAdjustEnd(): LogicFlow.Point;
    updateAfterAdjustStartAndEnd({ startPoint, endPoint, }: Record<'startPoint' | 'endPoint', Point>): void;
    updateZIndexByOverlap(overlapMode: OverlapMode, defaultZIndex: any): void;
}
export default BaseEdgeModel;
