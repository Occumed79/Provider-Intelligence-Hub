import type { OnWheelCallback, OnWheelGuard } from '../../types';
export declare class MouseWheelHandle {
    private target;
    private onWheelCallback;
    private onWheelGuard?;
    private animationFrameId;
    private deltaX;
    private deltaY;
    private eventName;
    constructor(target: HTMLElement | Document, onWheelCallback: OnWheelCallback, onWheelGuard?: OnWheelGuard);
    enable(): void;
    disable(): void;
    private onWheel;
    private didWheel;
}
