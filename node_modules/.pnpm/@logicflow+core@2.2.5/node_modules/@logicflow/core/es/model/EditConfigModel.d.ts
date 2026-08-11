import { TextMode } from '../constant';
export interface IEditConfigType {
    /**
     * 是否为静默模式
     */
    isSilentMode: boolean;
    /**
     * 禁止缩放画布
     */
    stopZoomGraph: boolean;
    /**
     * 禁止鼠标滚动移动画布
     */
    stopScrollGraph: boolean;
    /**
     * 禁止拖动画布，默认为false
     * - true：完全禁止移动
     * - vertical： 禁止垂直方向拖动
     * - horizontal：禁止水平方向拖动
     * - [number, number, number, number]：[minX, minY, maxX, maxY] 画布可拖动范围
     */
    stopMoveGraph: boolean | 'vertical' | 'horizontal' | [number, number, number, number];
    /**
     * 允许调整边
     */
    adjustEdge: boolean;
    /**
     * 允许调整边的中间点
     */
    adjustEdgeMiddle: boolean;
    /**
     * 允许调整边起点和终点
     */
    adjustEdgeStartAndEnd: boolean;
    /**
     * 允许调整边起点
     */
    adjustEdgeStart: boolean;
    /**
     * 允许调整边的终点
     */
    adjustEdgeEnd: boolean;
    /**
     * 允许拖动节点
     */
    adjustNodePosition: boolean;
    /**
     * 隐藏节点所有锚点
     */
    hideAnchors: boolean;
    /**
     * 是否允许节点旋转（旋转点的显隐）
     */
    allowRotate: boolean;
    /**
     * 是否允许节点缩放（缩放调整点的显隐）
     */
    allowResize: boolean;
    /**
     * 是否自动展开
     */
    autoExpand: boolean;
    /**
     * 显示节点悬浮时的外框
     */
    hoverOutline: boolean;
    /**
     * 节点被选中时是否显示outline
     */
    nodeSelectedOutline: boolean;
    /**
     * 边被选中时是否显示outline
     */
    edgeSelectedOutline: boolean;
    /**
     * 允许文本可编辑
     */
    textEdit: boolean;
    /**
     * 允许节点文本可以编辑
     */
    nodeTextEdit: boolean;
    /**
     * 允许边文本可以编辑
     */
    edgeTextEdit: boolean;
    /**
     * 允许文本可拖拽（文本包括Text、Label）
     */
    textDraggable: boolean;
    /**
     * 允许节点文本可以拖拽
     */
    nodeTextDraggable: boolean;
    /**
     * 允许边文本可以拖拽
     */
    edgeTextDraggable: boolean;
    /**
     * 多选按键, 支持meta(cmd)、shift、alt
     * 不支持ctrl，ctrl会触发contextmenu
     */
    multipleSelectKey: string;
    /**
     * 2.0.0 新增配置，启用 Label 后生效
     * 是否支持多文本，文本文字是否垂直展示
     * 当前文本类型
     */
    nodeTextMultiple: boolean;
    edgeTextMultiple: boolean;
    nodeTextVertical: boolean;
    edgeTextVertical: boolean;
    textMode: TextMode;
    nodeTextMode: TextMode;
    edgeTextMode: TextMode;
    snapGrid: boolean;
    isPinching: boolean;
}
export type IConfigKeys = keyof IEditConfigType;
/**
 * 页面编辑配置
 */
export declare class EditConfigModel {
    stagedConfig?: Partial<IEditConfigType>;
    /*********************************************************
     * 画布相关配置
     ********************************************************/
    isSilentMode: boolean;
    stopZoomGraph: boolean;
    stopMoveGraph: boolean;
    stopScrollGraph: boolean;
    snapGrid: boolean;
    isPinching: boolean;
    /*********************************************************
     * 文本相关配置（全局）
     ********************************************************/
    textMode: TextMode;
    textEdit: boolean;
    textDraggable: boolean;
    nodeTextEdit: boolean;
    nodeTextDraggable: boolean;
    nodeTextMultiple: boolean;
    nodeTextVertical: boolean;
    nodeTextMode: TextMode;
    edgeTextMode: TextMode;
    edgeTextEdit: boolean;
    edgeTextDraggable: boolean;
    edgeTextMultiple: boolean;
    edgeTextVertical: boolean;
    /*********************************************************
     * 节点相关配置
     ********************************************************/
    hideAnchors: boolean;
    allowRotate: boolean;
    allowResize: boolean;
    hoverOutline: boolean;
    nodeSelectedOutline: boolean;
    adjustNodePosition: boolean;
    autoExpand: boolean;
    /*********************************************************
     * 边相关配置
     ********************************************************/
    adjustEdge: boolean;
    adjustEdgeMiddle: boolean;
    adjustEdgeStartAndEnd: boolean;
    adjustEdgeStart: boolean;
    adjustEdgeEnd: boolean;
    edgeSelectedOutline: boolean;
    /*********************************************************
     * 其他
     ********************************************************/
    multipleSelectKey: string;
    constructor(config: Partial<IEditConfigType>);
    updateEditConfig(config: Partial<IEditConfigType>): void;
    computeConfig(config: Partial<IEditConfigType>): Partial<IEditConfigType> & Pick<Partial<IEditConfigType>, "textMode" | "adjustEdgeStartAndEnd" | "edgeTextDraggable" | "edgeTextEdit" | "nodeTextDraggable" | "nodeTextEdit" | "adjustEdge" | "edgeTextMode" | "nodeTextMode" | "allowRotate" | "allowResize" | "isSilentMode" | "stopScrollGraph" | "stopZoomGraph" | "stopMoveGraph" | "textEdit" | "snapGrid" | "adjustEdgeMiddle" | "adjustEdgeStart" | "adjustEdgeEnd" | "adjustNodePosition" | "hideAnchors" | "autoExpand" | "hoverOutline" | "nodeSelectedOutline" | "edgeSelectedOutline" | "textDraggable" | "multipleSelectKey" | "nodeTextMultiple" | "edgeTextMultiple" | "nodeTextVertical" | "edgeTextVertical" | "isPinching">;
    updateTextMode(textMode: TextMode): void;
    getConfig(): IEditConfigType;
}
export default EditConfigModel;
