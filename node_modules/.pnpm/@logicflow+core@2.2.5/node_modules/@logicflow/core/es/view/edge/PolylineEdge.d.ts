import { createElement as h } from 'preact/compat';
import BaseEdge from './BaseEdge';
import LogicFlow from '../../LogicFlow';
import { GraphModel, PolylineEdgeModel } from '../../model';
import { StepDrag } from '../../util';
import ArrowInfo = LogicFlow.ArrowInfo;
import AppendConfig = LogicFlow.AppendConfig;
import Point = LogicFlow.Point;
export type IPolylineEdgeProps = {
    model: PolylineEdgeModel;
    graphModel: GraphModel;
};
export declare class PolylineEdge extends BaseEdge<IPolylineEdgeProps> {
    drag: StepDrag;
    isDragging?: boolean;
    isShowAdjustPointTemp?: boolean;
    appendInfo?: AppendConfig;
    constructor();
    /**
     * 不支持重写
     */
    onDragStart: () => void;
    /**
     * 不支持重写
     */
    onDragging: ({ deltaX, deltaY }: {
        deltaX: any;
        deltaY: any;
    }) => void;
    /**
     * 不支持重写
     */
    onDragEnd: () => void;
    /**
     * 不支持重写
     */
    beforeDragStart: (e: PointerEvent, appendInfo: any) => void;
    /**
     * @overridable 支持重写, 此方法为获取边的形状，如果需要自定义边的形状，请重写此方法。
     * @example https://docs.logic-flow.cn/docs/#/zh/guide/basic/edge?id=%e5%9f%ba%e4%ba%8e-react-%e7%bb%84%e4%bb%b6%e8%87%aa%e5%ae%9a%e4%b9%89%e8%be%b9
     */
    getEdge(): h.JSX.Element;
    /**
     * @deprecated
     */
    getArrowInfo(): ArrowInfo;
    getLastTwoPoints(): [Point, Point];
    private getAppendAttributes;
    private getAppendShape;
    /**
     * @overridable 可重写，在完全自定义边的时候，可以重写此方法，来自定义边的选区。
     */
    getAppendWidth(): h.JSX.Element;
}
export default PolylineEdge;
