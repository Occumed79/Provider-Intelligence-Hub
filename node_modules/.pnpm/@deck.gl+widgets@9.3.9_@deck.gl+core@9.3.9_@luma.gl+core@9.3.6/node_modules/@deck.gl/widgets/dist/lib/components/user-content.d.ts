import type { JSX } from 'preact';
export type UserContentProps = JSX.HTMLAttributes<HTMLDivElement> & {
    text?: string;
    html?: string;
    element?: HTMLElement | null;
};
export declare const UserContent: ({ text, html, element, ...props }: UserContentProps) => JSX.Element;
//# sourceMappingURL=user-content.d.ts.map