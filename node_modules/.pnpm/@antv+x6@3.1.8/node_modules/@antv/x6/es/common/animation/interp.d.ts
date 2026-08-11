export type Definition<T> = (from: T, to: T) => (time: number) => T;
export declare const number: Definition<number>;
export declare const object: Definition<{
    [key: string]: number;
}>;
export declare const unit: Definition<string>;
export declare const color: Definition<string>;
export declare const transform: Definition<string>;
