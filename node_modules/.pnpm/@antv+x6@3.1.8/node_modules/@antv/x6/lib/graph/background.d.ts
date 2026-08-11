import type { BackgroundManualItem, BackgroundNativeItem, BackgroundOptions } from '../registry';
import { Base } from './base';
export type BackgroundManagerOptions = BackgroundOptions | BackgroundNativeItem | BackgroundManualItem;
export declare class BackgroundManager extends Base {
    protected optionsCache: BackgroundManagerOptions | null;
    protected get elem(): HTMLDivElement;
    protected init(): void;
    protected startListening(): void;
    protected stopListening(): void;
    protected updateBackgroundImage(options?: BackgroundManagerOptions): void;
    protected drawBackgroundImage(img?: HTMLImageElement | null, options?: BackgroundManagerOptions): void;
    protected updateBackgroundColor(color?: string | null): void;
    protected updateBackgroundOptions(options?: BackgroundManagerOptions): void;
    update(): void;
    draw(options?: BackgroundManagerOptions): void;
    clear(): void;
    dispose(): void;
}
