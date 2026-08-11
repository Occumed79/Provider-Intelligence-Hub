import type { JSX, ComponentChildren } from 'preact';
import { type Placement } from '@floating-ui/dom';
export type PopoverProps = {
    /** Anchor x */
    x: number;
    /** Anchor y */
    y: number;
    /** Position content relative to the anchor.
     * @default 'right'
     */
    placement?: Placement;
    /** Pixel offset
     * @default 0
     */
    offset?: number;
    /**
     * Show an arrow pointing at the anchor. Optionally accepts a pixel size.
     * @default false
     */
    arrow?: false | number | [width: number, height: number];
    /**
     * CSS color of the arrow
     * @default 'white'
     */
    arrowColor?: string;
    /** Content of the popover */
    children: ComponentChildren;
};
export declare const Popover: ({ x, y, placement, offset: pixelOffset, arrow: arrowSize, arrowColor, children }: PopoverProps) => JSX.Element;
//# sourceMappingURL=popover.d.ts.map