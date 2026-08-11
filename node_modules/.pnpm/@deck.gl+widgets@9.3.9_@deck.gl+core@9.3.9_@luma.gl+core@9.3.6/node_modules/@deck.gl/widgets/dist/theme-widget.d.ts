import { Widget, type WidgetProps, type WidgetPlacement } from '@deck.gl/core';
import type { DeckWidgetTheme } from "./themes.js";
export type ThemeWidgetProps = WidgetProps & {
    /** Widget positioning within the view. Default 'top-left'. */
    placement?: WidgetPlacement;
    /** View to attach to and interact with. Required when using multiple views. */
    viewId?: string | null;
    /** Tooltip message when dark mode is selected. */
    lightModeLabel?: string;
    /** Styles for light mode theme */
    lightModeTheme?: DeckWidgetTheme;
    /** Tooltip message when light mode is selected. */
    darkModeLabel?: string;
    /** Styles for dark mode theme */
    darkModeTheme?: DeckWidgetTheme;
    /** Initial theme mode for uncontrolled usage. 'auto' reads the browser default setting */
    initialThemeMode?: 'auto' | 'light' | 'dark';
    /**
     * Controlled theme mode. When provided, the widget is in controlled mode
     * and this prop determines the current theme.
     */
    themeMode?: 'light' | 'dark';
    /**
     * Callback when the user clicks the theme toggle button.
     * In controlled mode, use this to update the themeMode prop.
     * In uncontrolled mode, this is called after the internal state updates.
     */
    onThemeModeChange?: (newMode: 'light' | 'dark') => void;
};
export declare class ThemeWidget extends Widget<ThemeWidgetProps> {
    static defaultProps: Required<ThemeWidgetProps>;
    className: string;
    placement: WidgetPlacement;
    themeMode: 'light' | 'dark';
    appliedTheme: DeckWidgetTheme;
    constructor(props?: ThemeWidgetProps);
    setProps(props: Partial<ThemeWidgetProps>): void;
    onRenderHTML(rootElement: HTMLElement): void;
    /**
     * Returns the current theme mode.
     * In controlled mode, returns the themeMode prop.
     * In uncontrolled mode, returns the internal state.
     */
    getThemeMode(): 'light' | 'dark';
    _handleClick(): void;
    /** Apply theme styling without changing internal state */
    _applyTheme(themeMode: 'light' | 'dark', rootElement: HTMLElement): void;
    /** Read browser preference */
    _getInitialThemeMode(): 'light' | 'dark';
}
//# sourceMappingURL=theme-widget.d.ts.map