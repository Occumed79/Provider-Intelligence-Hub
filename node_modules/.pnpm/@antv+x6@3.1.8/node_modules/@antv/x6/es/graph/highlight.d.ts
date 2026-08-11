import type { KeyValue } from '../common';
import type { HighlighterDefinition, HighlighterManualItem, HighlighterNativeItem } from '../registry';
import type { CellView } from '../view';
import type { CellViewHighlightOptions } from '../view/cell/type';
import { Base } from './base';
import type { EventArgs } from './events';
interface Cache {
    highlighter: HighlighterDefinition<KeyValue>;
    cellView: CellView;
    magnet: Element;
    args: KeyValue;
}
export type HighlightManagerOptions = HighlighterNativeItem | HighlighterManualItem;
export declare class HighlightManager extends Base {
    protected readonly highlights: KeyValue<Cache>;
    protected init(): void;
    protected startListening(): void;
    protected stopListening(): void;
    protected onCellHighlight({ view: cellView, magnet, options, }: EventArgs['cell:highlight']): void;
    protected onCellUnhighlight({ magnet, options, }: EventArgs['cell:unhighlight']): void;
    protected resolveHighlighter(options: CellViewHighlightOptions): {
        name: string;
        highlighter: import("../registry").HighlighterCommonDefinition;
        args: KeyValue<any>;
    };
    protected getHighlighterId(magnet: Element, options: NonNullable<ReturnType<typeof HighlightManager.prototype.resolveHighlighter>>): string;
    protected unhighlight(id: string): void;
    dispose(): void;
}
export {};
