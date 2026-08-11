import type { ModifierKey } from '../../common';
import type { Cell } from '../../model';
import type { SelectionFilter, SelectionContent, SelectionSetOptions, SelectionAddOptions, SelectionRemoveOptions } from './index';
import type { SelectionImplEventArgsRecord } from './selection';
declare module '../../graph/graph' {
    interface Graph {
        isSelectionEnabled: () => boolean;
        enableSelection: () => Graph;
        disableSelection: () => Graph;
        toggleSelection: (enabled?: boolean) => Graph;
        isMultipleSelection: () => boolean;
        enableMultipleSelection: () => Graph;
        disableMultipleSelection: () => Graph;
        toggleMultipleSelection: (multiple?: boolean) => Graph;
        isSelectionMovable: () => boolean;
        enableSelectionMovable: () => Graph;
        disableSelectionMovable: () => Graph;
        toggleSelectionMovable: (movable?: boolean) => Graph;
        isRubberbandEnabled: () => boolean;
        enableRubberband: () => Graph;
        disableRubberband: () => Graph;
        toggleRubberband: (enabled?: boolean) => Graph;
        isStrictRubberband: () => boolean;
        enableStrictRubberband: () => Graph;
        disableStrictRubberband: () => Graph;
        toggleStrictRubberband: (strict?: boolean) => Graph;
        setRubberbandModifiers: (modifiers?: string | ModifierKey[] | null) => Graph;
        setSelectionFilter: (filter?: SelectionFilter) => Graph;
        setSelectionDisplayContent: (content?: SelectionContent) => Graph;
        isSelectionEmpty: () => boolean;
        cleanSelection: (options?: SelectionSetOptions) => Graph;
        resetSelection: (cells?: Cell | string | (Cell | string)[], options?: SelectionSetOptions) => Graph;
        getSelectedCells: () => Cell[];
        getSelectedCellCount: () => number;
        isSelected: (cell: Cell | string) => boolean;
        select: (cells: Cell | string | (Cell | string)[], options?: SelectionAddOptions) => Graph;
        unselect: (cells: Cell | string | (Cell | string)[], options?: SelectionRemoveOptions) => Graph;
    }
}
declare module '../../graph/events' {
    interface EventArgs extends SelectionImplEventArgsRecord {
    }
}
