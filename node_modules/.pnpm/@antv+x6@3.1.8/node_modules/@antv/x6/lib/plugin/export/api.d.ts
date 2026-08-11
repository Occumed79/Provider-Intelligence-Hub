import type { ExportToImageOptions, ExportToSVGCallback, ExportToSVGOptions } from './type';
declare module '../../graph/graph' {
    interface Graph {
        toSVG: (callback: ExportToSVGCallback, options?: ExportToSVGOptions) => void;
        toSVGAsync: (options?: ExportToSVGOptions) => Promise<string>;
        toPNG: (callback: ExportToSVGCallback, options?: ExportToImageOptions) => void;
        toPNGAsync: (options?: ExportToImageOptions) => Promise<string>;
        toJPEG: (callback: ExportToSVGCallback, options?: ExportToImageOptions) => void;
        toJPEGAsync: (options?: ExportToImageOptions) => Promise<string>;
        exportPNG: (fileName?: string, options?: ExportToImageOptions) => void;
        exportJPEG: (fileName?: string, options?: ExportToImageOptions) => void;
        exportSVG: (fileName?: string, options?: ExportToSVGOptions) => void;
    }
}
