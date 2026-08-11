import type { ModifierKey } from '../common';
import { Dom } from '../common';
import { Base } from './base';
type EventType = 'leftMouseDown' | 'rightMouseDown' | 'mouseWheel' | 'mouseWheelDown';
export interface PanningOptions {
    enabled?: boolean;
    modifiers?: string | ModifierKey[] | null;
    eventTypes?: EventType[];
}
export declare class PanningManager extends Base {
    private panning;
    private clientX;
    private clientY;
    private mousewheelHandle;
    private isSpaceKeyPressed;
    protected get widgetOptions(): PanningOptions;
    get pannable(): boolean;
    protected init(): void;
    protected startListening(): void;
    protected stopListening(): void;
    allowPanning(e: Dom.EventObject, strict?: boolean): boolean;
    protected startPanning(evt: Dom.MouseDownEvent): void;
    protected pan(evt: Dom.MouseMoveEvent): void;
    protected stopPanning(e: Dom.MouseUpEvent): void;
    protected updateClassName(e?: Dom.EventObject): void;
    protected onMouseDown({ e }: {
        e: Dom.MouseDownEvent;
    }): void;
    protected onRightMouseDown(e: Dom.MouseDownEvent): void;
    protected onMouseWheel(e: WheelEvent, deltaX: number, deltaY: number): void;
    protected onKeyDown(e: Dom.KeyDownEvent): void;
    protected onKeyUp(e: Dom.KeyUpEvent): void;
    protected allowBlankMouseDown(e: Dom.MouseDownEvent): boolean;
    protected allowMouseWheel(e: WheelEvent): boolean;
    autoPanning(x: number, y: number): void;
    enablePanning(): void;
    disablePanning(): void;
    dispose(): void;
}
export {};
