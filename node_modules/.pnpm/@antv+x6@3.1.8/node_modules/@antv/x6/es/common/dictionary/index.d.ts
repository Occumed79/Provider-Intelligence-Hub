export declare class Dictionary<T extends Record<string, any>, V> {
    private map;
    private arr;
    constructor();
    clear(): void;
    has(key: T): boolean;
    get(key: T): V;
    set(key: T, value: V): void;
    delete(key: T): V;
    each(iterator: (value: V, key: T) => void): void;
    dispose(): void;
}
