import { type JSX, type ComponentChild } from 'preact';
export type MenuItem = string | {
    value?: string;
    label: string;
    icon?: string;
    onSelect?: () => void;
};
export type DropdownMenuProps = {
    menuItems: MenuItem[];
    onSelect?: (value: string) => void;
    style?: Partial<CSSStyleDeclaration>;
};
export declare const DropdownMenu: (props: DropdownMenuProps) => JSX.Element;
export type SimpleMenuProps = DropdownMenuProps & {
    trigger?: ComponentChild;
    isOpen: boolean;
    onClose: () => void;
};
export declare const SimpleMenu: (props: SimpleMenuProps) => JSX.Element | null;
//# sourceMappingURL=dropdown-menu.d.ts.map