import { Dom } from '../../common';
import { type EventArgs, Graph, GraphPlugin } from '../../graph';
import { View } from '../../view';
import type { MiniMapOptions, MiniMapViewGeometry } from './type';
export declare class MiniMap extends View implements GraphPlugin {
    name: string;
    private graph;
    readonly options: MiniMapOptions;
    container: HTMLDivElement;
    protected zoomHandle: HTMLDivElement;
    protected viewport: HTMLElement;
    protected sourceGraph: Graph;
    protected targetGraph: Graph;
    protected geometry: MiniMapViewGeometry;
    protected ratio: number;
    private targetGraphTransforming;
    protected get scroller(): any;
    protected get graphContainer(): any;
    constructor(options: Partial<MiniMapOptions>);
    init(graph: Graph): void;
    protected startListening(): void;
    protected stopListening(): void;
    protected onRemove(): void;
    protected onTransform(options: {
        ui: boolean;
    }): void;
    protected onModelUpdated(): void;
    protected updatePaper(width: number, height: number): this;
    protected updatePaper({ width, height }: EventArgs['resize']): this;
    protected updateViewport(): void;
    protected startAction(evt: Dom.MouseDownEvent): void;
    protected doAction(evt: Dom.MouseMoveEvent): void;
    protected stopAction(): void;
    protected scrollTo(evt: Dom.MouseDownEvent): void;
    dispose(): void;
}
