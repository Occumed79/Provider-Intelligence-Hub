import { Basecoat } from '../../common';
import type { Graph, GraphPlugin } from '../../graph';
import type { ExportEventArgs, ExportToDataURLOptions, ExportToImageOptions, ExportToSVGCallback, ExportToSVGOptions } from './type';
import './api';
export declare class Export extends Basecoat<ExportEventArgs> implements GraphPlugin {
    name: string;
    private graph;
    get view(): import("../../graph").GraphView;
    init(graph: Graph): void;
    exportPNG(fileName?: string, options?: ExportToImageOptions): void;
    exportJPEG(fileName?: string, options?: ExportToImageOptions): void;
    exportSVG(fileName?: string, options?: ExportToSVGOptions): void;
    toSVG(callback: ExportToSVGCallback, options?: ExportToSVGOptions): void;
    toDataURL(callback: ExportToSVGCallback, options: ExportToDataURLOptions): void;
    toPNG(callback: ExportToSVGCallback, options?: ExportToImageOptions): void;
    toJPEG(callback: ExportToSVGCallback, options?: ExportToImageOptions): void;
    protected notify<K extends keyof ExportEventArgs>(name: K, args: ExportEventArgs[K]): void;
    dispose(): void;
}
