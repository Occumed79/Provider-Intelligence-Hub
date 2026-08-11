import type { KeyValue } from '../common';
import type { CellView } from './cell';
export type FlagManagerAction = 'render' | 'update' | 'resize' | 'scale' | 'rotate' | 'translate' | 'ports' | 'tools' | 'source' | 'target' | 'vertices' | 'labels';
export type FlagManagerActions = FlagManagerAction | FlagManagerAction[];
export declare class FlagManager {
    protected view: CellView;
    protected attrs: {
        [attr: string]: number;
    };
    protected flags: {
        [name: string]: number;
    };
    protected bootstrap: FlagManagerActions;
    protected get cell(): import("..").Cell<import("..").CellProperties>;
    constructor(view: CellView, actions: KeyValue<FlagManagerActions>, bootstrap?: FlagManagerActions);
    getFlag(label: FlagManagerActions): number;
    hasAction(flag: number, label: FlagManagerActions): number;
    removeAction(flag: number, label: FlagManagerActions): number;
    getBootstrapFlag(): number;
    getChangedFlag(): number;
}
