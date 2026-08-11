export declare class Matrix extends Array {
    rows: number;
    columns: number;
    constructor(...vectors: any[]);
    getRow(index: number): any;
    getColumn(index: number): number[];
    transpose(): Matrix;
    cross(m1: Matrix): Matrix;
    to2D(): any[][];
    toString(): string;
    translate(tx: number, ty: number): Matrix;
    rotate(angle: number): Matrix;
    scale(sx: number, sy: number): Matrix;
}
export declare class RotateMatrix extends Matrix {
    constructor(theta: number);
    inverse(): Matrix;
}
export declare class ScaleMatrix extends Matrix {
    private readonly sx;
    private readonly sy;
    constructor(sx: number, sy: number);
    inverse(): ScaleMatrix;
}
export declare class TranslateMatrix extends Matrix {
    private readonly tx;
    private readonly ty;
    constructor(tx: number, ty: number);
    inverse(): TranslateMatrix;
}
