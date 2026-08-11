import LogicFlow from '../LogicFlow';
import { TransformModel } from './TransformModel';
import { Options as LFOptions } from '../options';
import EventEmitter from '../event/eventEmitter';
type PointTuple = LogicFlow.PointTuple;
export declare class NestedTransformModel extends TransformModel {
    parentTransform?: TransformModel;
    constructor(eventCenter: EventEmitter, options: LFOptions.Common);
    /**
     * 设置父级变换
     * @param parentTransform 父级变换模型
     */
    setParentTransform(parentTransform: TransformModel): void;
    /**
     * 获取累积的缩放值
     * 计算包括所有父级的累积缩放
     */
    private getCumulativeScale;
    /**
     * 获取累积的平移值
     * 计算包括所有父级的累积平移
     */
    private getCumulativeTranslate;
    /**
     * 将最外层graph上的点基于缩放转换为canvasOverlay层上的点。
     * 重写以支持嵌套变换
     * @param point HTML点
     */
    HtmlPointToCanvasPoint(point: PointTuple): PointTuple;
    /**
     * 将最外层canvasOverlay层上的点基于缩放转换为graph上的点。
     * 重写以支持嵌套变换
     * @param point Canvas点
     */
    CanvasPointToHtmlPoint(point: PointTuple): PointTuple;
    /**
     * 将一个在canvas上的点，向x轴方向移动directionX距离，向y轴方向移动directionY距离。
     * 重写以支持嵌套变换
     * @param point 点
     * @param directionX x轴距离
     * @param directionY y轴距离
     */
    moveCanvasPointByHtml(point: PointTuple, directionX: number, directionY: number): PointTuple;
    /**
     * 根据缩放情况，获取缩放后的delta距离
     * 重写以支持嵌套变换
     * @param deltaX x轴距离变化
     * @param deltaY y轴距离变化
     */
    fixDeltaXY(deltaX: number, deltaY: number): PointTuple;
}
export default NestedTransformModel;
