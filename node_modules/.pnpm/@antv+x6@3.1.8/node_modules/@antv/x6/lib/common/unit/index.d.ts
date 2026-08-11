export type Unit = 'px' | 'mm' | 'cm' | 'in' | 'pt' | 'pc';
export declare function measure(cssWidth: string, cssHeight: string, unit?: Unit): {
    width: number;
    height: number;
};
export declare function setMillimeterSize(pxPerMm: number): void;
export declare function getMillimeterSize(): number;
export declare function toPx(val: number, unit?: Unit): number;
