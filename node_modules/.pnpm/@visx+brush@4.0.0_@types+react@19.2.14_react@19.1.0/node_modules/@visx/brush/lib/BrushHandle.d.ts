import { Component } from 'react';
import type { ReactNode } from 'react';
import type { HandlerArgs as DragArgs } from '@visx/drag';
import type { BaseBrushState as BrushState, UpdateBrush } from './BaseBrush';
import type { BrushPageOffset, BrushingType, ResizeTriggerAreas } from './types';
type HandleProps = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export type BrushHandleProps = {
    stageWidth: number;
    stageHeight: number;
    brush: BrushState;
    updateBrush: (update: UpdateBrush) => void;
    onBrushStart?: (brush: DragArgs) => void;
    onBrushEnd?: (brush: BrushState) => void;
    type: ResizeTriggerAreas;
    handle: HandleProps;
    isControlled?: boolean;
    isDragInProgress?: boolean;
    onBrushHandleChange?: (type?: BrushingType, options?: BrushPageOffset) => void;
    renderBrushHandle?: (props: BrushHandleRenderProps) => ReactNode;
};
export type BrushHandleRenderProps = HandleProps & {
    /** if brush extent is not active this prop is set to false */
    isBrushActive: boolean;
    className: string;
};
/** BrushHandle's are placed along the bounds of the brush and handle Drag events which update the passed brush. */
export default class BrushHandle extends Component<BrushHandleProps> {
    handleDragStart: (drag: DragArgs) => void;
    handleDragMove: (drag: DragArgs) => void;
    handleDragEnd: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};
//# sourceMappingURL=BrushHandle.d.ts.map