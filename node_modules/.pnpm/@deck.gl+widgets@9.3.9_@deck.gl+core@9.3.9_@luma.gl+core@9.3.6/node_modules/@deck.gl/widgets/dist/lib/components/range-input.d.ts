import type { JSX } from 'preact';
export type RangeInputDecoration = {
    position: [start: number, end: number];
    element: JSX.Element;
};
export type RangeInputProps = {
    className?: string;
    min: number;
    max: number;
    step: number;
    value: [start: number, end: number];
    orientation: 'horizontal' | 'vertical';
    pageSize?: number;
    /** Show step buttons at ends */
    stepButtons?: boolean;
    startButtonAriaLabel?: string;
    endButtonAriaLabel?: string;
    /** Target element for wheel and keyboard events.
     * If not supplied, falls back to the root element of the input.
     */
    eventTarget?: HTMLElement | null;
    decorations?: RangeInputDecoration[];
    onChange?: (nextValue: [start: number, end: number]) => void;
};
export declare function RangeInput(props: RangeInputProps): JSX.Element;
//# sourceMappingURL=range-input.d.ts.map