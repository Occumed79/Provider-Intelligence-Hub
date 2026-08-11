import { GraphModel, Model } from '..';
import LogicFlow from '../../LogicFlow';
import { ElementState, ElementType, ModelType, OverlapMode, TextMode } from '../../constant';
import { ResizeControl } from '../../view/Control';
import AnchorConfig = Model.AnchorConfig;
import GraphElements = LogicFlow.GraphElements;
import TextConfig = LogicFlow.TextConfig;
import NodeConfig = LogicFlow.NodeConfig;
import NodeData = LogicFlow.NodeData;
import Point = LogicFlow.Point;
import CommonTheme = LogicFlow.CommonTheme;
import PropertiesType = LogicFlow.PropertiesType;
import ResizeInfo = ResizeControl.ResizeInfo;
import ResizeNodeData = ResizeControl.ResizeNodeData;
import PCTResizeParams = ResizeControl.PCTResizeParams;
export interface IBaseNodeModel<P extends PropertiesType> extends Model.BaseModel<P> {
    /**
     * model基础类型，固定为node
     */
    readonly BaseType: ElementType.NODE;
    properties: P;
    isDragging: boolean;
    isShowAnchor: boolean;
    getNodeStyle: () => CommonTheme;
    getTextStyle: () => LogicFlow.TextNodeTheme;
    setIsShowAnchor: (isShowAnchor: boolean) => void;
}
export declare class BaseNodeModel<P extends PropertiesType = PropertiesType> implements IBaseNodeModel<P> {
    readonly BaseType = ElementType.NODE;
    static BaseType: ElementType;
    id: string;
    readonly type = "";
    x: number;
    y: number;
    textMode: TextMode;
    text: TextConfig;
    properties: P;
    private _width;
    get width(): number;
    set width(value: number);
    private _height;
    get height(): number;
    set height(value: number);
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    PCTResizeInfo?: PCTResizeParams;
    anchorsOffset: BaseNodeModel.AnchorsOffsetItem[];
    readonly virtual: boolean;
    isSelected: boolean;
    isHovered: boolean;
    isShowAnchor: boolean;
    isDragging: boolean;
    isHitable: boolean;
    isHittable: boolean;
    draggable: boolean;
    visible: boolean;
    rotatable: boolean;
    resizable: boolean;
    graphModel: GraphModel;
    zIndex: number;
    state: ElementState;
    autoToFront: boolean;
    style: CommonTheme;
    transform: string;
    private _rotate;
    get rotate(): number;
    set rotate(value: number);
    modelType: ModelType;
    additionStateData?: Model.AdditionStateDataType;
    targetRules: Model.ConnectRule[];
    sourceRules: Model.ConnectRule[];
    moveRules: Model.NodeMoveRule[];
    resizeRules: Model.NodeResizeRule[];
    hasSetTargetRules: boolean;
    hasSetSourceRules: boolean;
    [propName: string]: any;
    constructor(data: NodeConfig<P>, graphModel: GraphModel);
    /**
     * 获取进入当前节点的边和节点
     */
    get incoming(): GraphElements;
    get outgoing(): GraphElements;
    /**
     * @overridable 可以重写
     * 初始化节点数据
     * initNodeData 和 setAttributes 的区别在于
     * initNodeData 只在节点初始化的时候调用，用于初始化节点的所有属性。
     * setAttributes 除了初始化调用外，还会在 properties 发生变化了调用。
     */
    initNodeData(data: NodeConfig): void;
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
    setAttributes(): void;
    /**
     * @overridable 支持重写，自定义此类型节点默认生成方式
     * @returns string | null
     */
    createId(): string | null;
    /**
     * 设置当前元素的文本模式
     * @param mode
     */
    setTextMode(mode: TextMode): void;
    /**
     * 始化文本属性
     */
    private formatText;
    /**
     * @overridable 支持重写
     * 计算节点 resize 时
     */
    resize(resizeInfo: ResizeInfo): ResizeNodeData;
    proportionalResize(): void;
    /**
     * 获取被保存时返回的数据
     * @overridable 支持重写
     */
    getData(): NodeData;
    /**
     * 用于在历史记录时获取节点数据，
     * 在某些情况下，如果希望某个属性变化不引起history的变化，
     * 可以重写此方法。
     */
    getHistoryData(): NodeData;
    /**
     * 获取当前节点的properties
     */
    getProperties(): P;
    /**
     * @overridable 支持重写
     * 获取当前节点最外层g标签Attributes, 例如 className
     * @returns 自定义节点样式
     */
    getOuterGAttributes(): LogicFlow.DomAttributes;
    /**
     * @overridable 支持重写
     * 获取当前节点样式
     * @returns 自定义节点样式
     */
    getNodeStyle(): CommonTheme;
    /**
     * @overridable 支持重写
     * 获取当前节点文本样式
     */
    getTextStyle(): {
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
        overflowMode?: "default" | "autoWrap" | "ellipsis" | undefined;
        textWidth?: number | undefined;
        background?: LogicFlow.CommonTheme | undefined;
        wrapPadding?: string | undefined;
        color?: string | undefined;
        fontSize: number;
        lineHeight?: number | undefined;
        textAnchor?: "middle" | "start" | "end" | undefined;
        dominantBaseline?: "middle" | "central" | "auto" | "text-bottom" | "alphabetic" | "ideographic" | "mathematical" | "hanging" | "text-top" | undefined;
    };
    /**
     * @overridable 支持重写
     * 获取当前节点旋转控制点的样式
     */
    getRotateControlStyle(): CommonTheme;
    /**
     * @overrideable 支持重写
     * 获取当前节点缩放控制节点的样式
     */
    getResizeControlStyle(): LogicFlow.CommonTheme;
    getResizeOutlineStyle(): {
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
     * @overridable 支持重写
     * 获取当前节点锚点样式
     * @returns 自定义样式
     */
    getAnchorStyle(_anchorInfo?: Point): LogicFlow.AnchorTheme;
    /**
     * @overridable 支持重写
     * 获取当前节点锚点拖出连线样式
     * @returns 自定义锚点拖出样式
     */
    getAnchorLineStyle(_anchorInfo?: Point): LogicFlow.AnchorLineTheme;
    /**
     * @overridable 支持重写
     * 获取outline样式，重写可以定义此类型节点outline样式， 默认使用主题样式
     * @returns 自定义outline样式
     */
    getOutlineStyle(): LogicFlow.OutlineTheme;
    /**
     * @overridable 在连接边时，是否允许这个节点为 source 节点，边到 target 节点
     * @param target 目标节点
     * @param sourceAnchor 源锚点
     * @param targetAnchor 目标锚点
     * @param edgeId 调整后边的 id，在开启 adjustEdgeStartAndEnd 后调整边连接的节点时会传入
     * 详见：https://github.com/didi/LogicFlow/issues/926#issuecomment-1371823306
     */
    isAllowConnectedAsSource(target: BaseNodeModel, sourceAnchor?: Model.AnchorConfig, targetAnchor?: Model.AnchorConfig, edgeId?: string): Model.ConnectRuleResult;
    /**
     * 获取当前节点作为连接的起始节点规则。
     */
    getConnectedSourceRules(): Model.ConnectRule[];
    /**
     * @overridable 在连线时，判断是否允许这个节点为 target 节点
     * @param source 源节点
     * @param sourceAnchor 源锚点
     * @param targetAnchor 目标锚点
     * @param edgeId 调整后边的 id，在开启 adjustEdgeStartAndEnd 后调整边连接的节点时会传入
     * 详见：https://github.com/didi/LogicFlow/issues/926#issuecomment-1371823306
     */
    isAllowConnectedAsTarget(source: BaseNodeModel, sourceAnchor?: Model.AnchorConfig, targetAnchor?: Model.AnchorConfig, edgeId?: string): Model.ConnectRuleResult;
    /**
     * 内部方法
     * 是否允许移动节点到新的位置
     */
    isAllowMoveNode(deltaX: number, deltaY: number): boolean | Model.IsAllowMove;
    /**
     * 获取作为连线终点时的所有规则。
     */
    getConnectedTargetRules(): Model.ConnectRule[];
    /**
     * @returns Point[] 锚点坐标构成的数组
     */
    getAnchorsByOffset(): Model.AnchorConfig[];
    /**
     * @overridable 子类重写此方法设置默认锚点
     * 获取节点默认情况下的锚点
     */
    getDefaultAnchor(): Model.AnchorConfig[];
    /**
     * @overridable 子类重写此方法获取手动连接边到节点时，需要连接的锚点
     * 手动连接边到节点时，需要连接的锚点
     */
    getTargetAnchor(position: Point): Model.AnchorInfo;
    /**
     * 获取节点BBox
     */
    getBounds(): Model.BoxBoundsPoint;
    get anchors(): Model.AnchorConfig[];
    getAnchorInfo(anchorId: string | undefined): AnchorConfig | undefined;
    addNodeMoveRules(fn: Model.NodeMoveRule): void;
    isAllowMoveByXORY(deltaX: number, deltaY: number, isIgnoreRule: boolean): {
        isAllowMoveX: boolean;
        isAllowMoveY: boolean;
    };
    move(deltaX: number, deltaY: number, isIgnoreRule?: boolean): boolean;
    getMoveDistance(deltaX: number, deltaY: number, isIgnoreRule?: boolean): [number, number];
    moveTo(x: number, y: number, isIgnoreRule?: boolean): boolean;
    moveText(deltaX: number, deltaY: number): void;
    updateText(value: string): void;
    addNodeResizeRules(fn: Model.NodeResizeRule): void;
    /**
     * 内部方法
     * 是否允许resize节点到新的位置
     */
    isAllowResizeNode(deltaX: number, deltaY: number, width: number, height: number): boolean;
    setSelected(flag?: boolean): void;
    setHovered(flag?: boolean): void;
    setIsShowAnchor(flag?: boolean): void;
    setRotatable(flag?: boolean): void;
    setResizable(flag?: boolean): void;
    setHitable(flag?: boolean): void;
    setHittable(flag?: boolean): void;
    setElementState(state: number, additionStateData?: Model.AdditionStateDataType): void;
    private updateProperties;
    setProperty(key: string, val: any): void;
    setProperties(properties: Record<string, any>): void;
    deleteProperty(key: string): void;
    setStyle(key: string, val: any): void;
    setStyles(styles: Record<string, any>): void;
    updateStyles(styles: Record<string, any>): void;
    setZIndex(zIndex?: number): void;
    updateAttributes(attributes: any): void;
    updateZIndexByOverlap(overlapMode: OverlapMode, defaultZIndex: any): void;
}
export declare namespace BaseNodeModel {
    type PointTuple = [number, number];
    type AnchorsOffsetItem = PointTuple | Point;
}
export default BaseNodeModel;
