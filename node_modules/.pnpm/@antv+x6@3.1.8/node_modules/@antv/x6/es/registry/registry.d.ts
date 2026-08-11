import { type KeyValue } from '../common';
export interface RegistryOptions<Entity> {
    type: string;
    data?: KeyValue<Entity>;
    process?: <T, Context extends Registry<any>>(this: Context, name: string, entity: Entity) => T;
    onConflict?: <Context extends Registry<any>>(this: Context, name: string) => void;
}
export declare class Registry<Entity, Presets = KeyValue<Entity>, OptionalType = never> {
    readonly data: KeyValue<Entity>;
    readonly options: RegistryOptions<Entity | OptionalType>;
    static create<Entity, Presets = KeyValue<Entity>, OptionalType = never>(options: RegistryOptions<Entity | OptionalType>): Registry<Entity, Presets, OptionalType>;
    constructor(options: RegistryOptions<Entity | OptionalType>);
    get names(): string[];
    register(entities: {
        [name: string]: Entity | OptionalType;
    }, force?: boolean): void;
    register<K extends keyof Presets>(name: K, entity: Presets[K], force?: boolean): Entity;
    register(name: string, entity: Entity | OptionalType, force?: boolean): Entity;
    unregister<K extends keyof Presets>(name: K): Entity | null;
    unregister(name: string): Entity | null;
    get<K extends keyof Presets>(name: K): Entity | null;
    get(name: string): Entity | null;
    exist<K extends keyof Presets>(name: K): boolean;
    exist(name: string): boolean;
    onDuplicated(name: string): void;
    onNotFound(name: string, prefix?: string): never;
    getSpellingSuggestion(name: string, prefix?: string): string;
    protected getSpellingSuggestionForName(name: string): string;
}
