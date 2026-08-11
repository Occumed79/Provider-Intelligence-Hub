import { Model } from '../model';
import EventEmitter from '../event/eventEmitter';
export type IDragParams = {
    deltaX: number;
    deltaY: number;
    event: MouseEvent | null;
    [key: string]: unknown;
};
export type ICreateDragParams = {
    onDragStart?: (params: Partial<IDragParams>) => void;
    onDragging?: (param: IDragParams) => void;
    onDragEnd?: (param: Partial<IDragParams>) => void;
    step?: number;
    isStopPropagation?: boolean;
};
export type IStepperDragProps = {
    eventType?: 'NODE' | 'BLANK' | 'SELECTION' | 'ADJUST_POINT' | 'TEXT' | 'LABEL' | '';
    eventCenter?: EventEmitter;
    model?: Model.BaseModel;
    data?: Record<string, unknown>;
    [key: string]: unknown;
} & Partial<ICreateDragParams>;
/**
 * 支持拖拽时按步长进行移动
 * REMIND：在绘制的过程中因为放大缩小，移动的真实 step 是变化的
 */
export declare class StepperDrag {
    onDragStart: (params: Partial<IDragParams>) => void;
    onDragging: (params: IDragParams) => void;
    onDragEnd: (params: Partial<IDragParams>) => void;
    step: number;
    isStopPropagation: boolean;
    eventType: 'NODE' | 'BLANK' | 'SELECTION' | 'ADJUST_POINT' | 'TEXT' | 'LABEL' | '';
    eventCenter?: EventEmitter;
    model?: Model.BaseModel;
    data?: Record<string, unknown>;
    isDragging: boolean;
    isStartDrag: boolean;
    startX: number;
    startY: number;
    totalDeltaX: number;
    totalDeltaY: number;
    startTime?: number;
    constructor({ onDragStart, onDragging, onDragEnd, step, eventType, isStopPropagation, eventCenter, model, data, }: IStepperDragProps);
    setStep(step: number): void;
    handleMouseMove: (e: MouseEvent) => void;
    handleMouseUp: (e: MouseEvent) => void;
    handleMouseDown: (e: MouseEvent) => void;
    cancelDrag: () => void;
}
export default StepperDrag;
