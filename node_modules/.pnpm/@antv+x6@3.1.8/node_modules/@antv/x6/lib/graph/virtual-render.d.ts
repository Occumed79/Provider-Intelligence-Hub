import { Base } from './base';
export declare class VirtualRenderManager extends Base {
    private scrollerRef?;
    private scrollerScrollHandler?;
    protected init(): void;
    private bindScrollerEvents;
    protected startListening(): void;
    protected stopListening(): void;
    onScrollerReady(scroller: any): void;
    unbindScroller(): void;
    private setVirtualEnabled;
    enableVirtualRender(): void;
    disableVirtualRender(): void;
    isVirtualEnabled(): boolean;
    private getVirtualMargin;
    resetRenderArea(): void;
    dispose(): void;
}
