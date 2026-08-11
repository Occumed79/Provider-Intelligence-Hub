export declare function isDataUrl(url: string): boolean;
/**
 * Converts an image at `url` to base64-encoded data uri.
 * The mime type of the image is inferred from the `url` file extension.
 */
export declare function imageToDataUri(url: string, callback: (err: Error | null, dataUri?: string) => any): void;
export declare function dataUriToBlob(dataUrl: string): Blob;
export declare function downloadBlob(blob: Blob, fileName: string): void;
export declare function downloadDataUri(dataUrl: string, fileName: string): void;
export declare function svgToDataUrl(svg: string, options?: {
    width?: number | null;
    height?: number | null;
}): string;
