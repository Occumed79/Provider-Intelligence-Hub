import { Model } from '../model';
import EventEmitter from '../event/eventEmitter';
export type IDragParams = {
    deltaX: number;
    deltaY: number;
    event?: PointerEvent;
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
    model?: Model.BaseModel | unknown;
    data?: Record<string, unknown>;
    [key: string]: unknown;
} & Partial<ICreateDragParams>;
export declare class StepDrag {
    onDragStart: (params: Partial<IDragParams>) => void;
    onDragging: (params: IDragParams) => void;
    onDragEnd: (params: Partial<IDragParams>) => void;
    step: number;
    isStopPropagation: boolean;
    eventType: 'NODE' | 'BLANK' | 'SELECTION' | 'ADJUST_POINT' | 'TEXT' | 'LABEL' | '';
    eventCenter?: EventEmitter;
    model?: Model.BaseModel | any;
    data?: Record<string, unknown>;
    isDragging: boolean;
    isStartDragging: boolean;
    startX: number;
    startY: number;
    sumDeltaX: number;
    sumDeltaY: number;
    startTime?: number;
    constructor({ onDragStart, onDragging, onDragEnd, eventType, eventCenter, step, isStopPropagation, model, data, }: IStepperDragProps);
    setStep(step: number): void;
    setModel(model: Model.BaseModel): void;
    handleMouseDown: (e: PointerEvent) => void;
    handleMouseMove: (e: PointerEvent) => void;
    handleMouseUp: (e: PointerEvent) => void;
    cancelDrag: () => void;
    destroy: () => void;
}
