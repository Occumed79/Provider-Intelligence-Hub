import { ResizeControl, ResizeControlIndex } from '../view/Control';
import { BaseNodeModel, GraphModel } from '../model';
import ResizeInfo = ResizeControl.ResizeInfo;
import ResizeNodeData = ResizeControl.ResizeNodeData;
import type { SimplePoint } from '../algorithm/rotate';
export declare function calculateWidthAndHeight(startRotatedTouchControlPoint: SimplePoint, endRotatedTouchControlPoint: SimplePoint, oldCenter: SimplePoint, angle: number, freezeWidth: boolean | undefined, freezeHeight: boolean | undefined, oldWidth: number, oldHeight: number): {
    width: number;
    height: number;
    center: {
        x: number;
        y: number;
    };
};
/**
 * 计算 Control 拖动后，节点的高度信息
 * @param index
 * @param resizeInfo
 * @param pct
 * @param freezeWidth
 * @param freezeHeight
 */
export declare const recalcResizeInfo: (index: ResizeControlIndex, resizeInfo: ResizeInfo, pct: number | undefined, freezeWidth: boolean | undefined, freezeHeight: boolean | undefined, rotate: number | undefined, controlX: number | undefined, controlY: number | undefined, oldCenterX: number, oldCenterY: number, forceProportional?: boolean) => ResizeInfo;
export declare const updateEdgePointByAnchors: (nodeModel: BaseNodeModel, graphModel: GraphModel) => void;
export declare const triggerResizeEvent: (preNodeData: ResizeNodeData, curNodeData: ResizeNodeData, deltaX: number, deltaY: number, index: number, nodeModel: BaseNodeModel, graphModel: GraphModel) => void;
export type IHandleResizeParams = {
    x?: number;
    y?: number;
    deltaX: number;
    deltaY: number;
    index: ResizeControlIndex;
    nodeModel: BaseNodeModel;
    graphModel: GraphModel;
    cancelCallback?: () => void;
    forceProportional?: boolean;
};
/**
 * 处理节点的 resize 事件，提出来放到 utils 中，方便在外面（extension）中使用
 * @param x
 * @param y
 * @param deltaX
 * @param deltaY
 * @param index
 * @param nodeModel
 * @param graphModel
 * @param cancelCallback
 * @param forceProportional
 */
export declare const handleResize: ({ x, y, deltaX, deltaY, index, nodeModel, graphModel, cancelCallback, forceProportional, }: IHandleResizeParams) => void;
