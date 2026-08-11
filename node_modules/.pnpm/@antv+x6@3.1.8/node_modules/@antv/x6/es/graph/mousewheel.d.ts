import type { ModifierKey } from '../common';
import { Base } from './base';
export interface MouseWheelOptions {
    enabled?: boolean;
    global?: boolean;
    factor?: number;
    minScale?: number;
    maxScale?: number;
    modifiers?: string | ModifierKey[] | null;
    guard?: (e: WheelEvent) => boolean;
    zoomAtMousePosition?: boolean;
}
export declare class MouseWheel extends Base {
    target: HTMLElement | Document;
    container: HTMLElement;
    protected cumulatedFactor: number;
    protected currentScale: number | null;
    protected startPos: {
        x: number;
        y: number;
    };
    private mousewheelHandle;
    protected get widgetOptions(): MouseWheelOptions;
    protected init(): void;
    get disabled(): boolean;
    enable(force?: boolean): void;
    disable(): void;
    protected allowMouseWheel(e: WheelEvent): boolean;
    protected onMouseWheel(e: WheelEvent): void;
    dispose(): void;
}
