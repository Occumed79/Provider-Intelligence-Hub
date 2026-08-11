import type { Dom } from '../dom';
export type ModifierKey = 'alt' | 'ctrl' | 'meta' | 'shift' | 'space';
export declare function parseModifierKey(modifiers: string | ModifierKey[]): {
    or: ModifierKey[];
    and: ModifierKey[];
};
export declare function isModifierKeyEqual(modifiers1?: string | ModifierKey[] | null, modifiers2?: string | ModifierKey[] | null): boolean;
export declare function isModifierKeyMatch(e: Dom.EventObject | WheelEvent, modifiers?: string | ModifierKey[] | null, strict?: boolean): boolean;
