export declare class SortedSet {
    items: string[];
    hash: {
        [key: string]: number;
    };
    values: {
        [key: string]: number;
    };
    indexes: {
        [key: string]: number;
    };
    constructor();
    private swap;
    private less;
    private bubbleUp;
    private bubbleDown;
    add(item: string, value: number): void;
    pop(): string;
    isOpen(item: string): boolean;
    isClose(item: string): boolean;
    isEmpty(): boolean;
}
