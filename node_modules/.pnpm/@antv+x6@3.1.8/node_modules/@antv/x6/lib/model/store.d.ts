import type { Assign, NonUndefined } from 'utility-types';
import { Basecoat, type KeyValue } from '../common';
export interface StoreSetOptions extends KeyValue {
    silent?: boolean;
}
export interface StoreMutateOptions extends StoreSetOptions {
    unset?: boolean;
}
export interface StoreSetByPathOptions extends StoreSetOptions {
    rewrite?: boolean;
}
type CommonArgs<D> = {
    store: Store<D>;
};
export interface EventArgs<D, K extends keyof D = keyof D> {
    'change:*': Assign<{
        key: K;
        current: D[K];
        previous: D[K];
        options: StoreMutateOptions;
    }, CommonArgs<D>>;
    changed: Assign<{
        current: D;
        previous: D;
        options: StoreMutateOptions;
    }, CommonArgs<D>>;
    disposed: CommonArgs<D>;
}
export declare class Store<D> extends Basecoat<EventArgs<D>> {
    protected data: D;
    protected previous: D;
    protected changed: Partial<D>;
    protected pending: boolean;
    protected changing: boolean;
    protected pendingOptions: StoreMutateOptions | null;
    constructor(data?: Partial<D>);
    protected mutate<K extends keyof D>(data: Partial<D>, options?: StoreMutateOptions): this;
    get(): D;
    get<K extends keyof D>(key: K): D[K];
    get<K extends keyof D>(key: K, defaultValue: D[K]): NonUndefined<D[K]>;
    get<T>(key: string): T;
    get<T>(key: string, defaultValue: T): T;
    getPrevious<T>(key: keyof D): T;
    set<K extends keyof D>(key: K, value: D[K] | null | undefined | void, options?: StoreSetOptions): this;
    set(key: string, value: any, options?: StoreSetOptions): this;
    set(data: D, options?: StoreSetOptions): this;
    remove<K extends keyof D>(key: K | K[], options?: StoreSetOptions): this;
    remove(options?: StoreSetOptions): this;
    getByPath<T>(path: string | string[]): T;
    setByPath<K extends keyof D>(path: string | string[], value: any, options?: StoreSetByPathOptions): this;
    removeByPath<K extends keyof D>(path: string | string[], options?: StoreSetOptions): this;
    hasChanged(): boolean;
    hasChanged<K extends keyof D>(key: K | null): boolean;
    hasChanged(key: string | null): boolean;
    /**
     * Returns an object containing all the data that have changed,
     * or `null` if there are no changes. Useful for determining what
     * parts of a view need to be updated.
     */
    getChanges(diff?: Partial<D>): Partial<D>;
    /**
     * Returns a copy of the store's `data` object.
     */
    toJSON(): D;
    clone<T extends typeof Store>(): T;
    dispose(): void;
}
export {};
