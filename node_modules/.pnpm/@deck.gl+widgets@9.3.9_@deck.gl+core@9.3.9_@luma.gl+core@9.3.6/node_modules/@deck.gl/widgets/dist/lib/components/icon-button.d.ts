import type { ComponentChildren, JSX } from 'preact';
export type IconButtonProps = {
    className?: string;
    icon?: string;
    label?: string;
    color?: string;
    style?: JSX.CSSProperties;
    onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
    children?: ComponentChildren;
};
/** Renders a button component with widget CSS */
export declare const IconButton: (props: IconButtonProps) => JSX.Element;
//# sourceMappingURL=icon-button.d.ts.map