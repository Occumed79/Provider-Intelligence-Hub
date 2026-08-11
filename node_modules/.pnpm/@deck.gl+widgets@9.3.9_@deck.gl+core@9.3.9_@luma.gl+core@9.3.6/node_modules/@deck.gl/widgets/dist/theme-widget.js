import { jsx as _jsx } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { log, _deepEqual as deepEqual, _applyStyles as applyStyles } from '@deck.gl/core';
import { Widget } from '@deck.gl/core';
import { render } from 'preact';
// import {useCallback} from 'preact/hooks';
import { IconButton } from "./lib/components/icon-button.js";
import { LightGlassTheme, DarkGlassTheme } from "./themes.js";
export class ThemeWidget extends Widget {
    constructor(props = {}) {
        super(props);
        this.className = 'deck-widget-theme';
        this.placement = 'top-left';
        this.themeMode = 'dark';
        this.appliedTheme = {};
        this.themeMode = this._getInitialThemeMode();
        this.setProps(this.props);
    }
    // eslint-disable-next-line complexity
    setProps(props) {
        this.placement = props.placement ?? this.placement;
        this.viewId = props.viewId ?? this.viewId;
        super.setProps(props);
    }
    onRenderHTML(rootElement) {
        const { lightModeLabel, darkModeLabel } = this.props;
        const currentMode = this.getThemeMode();
        this._applyTheme(currentMode, rootElement);
        render(_jsx(IconButton, { onClick: this._handleClick.bind(this), label: currentMode === 'dark' ? darkModeLabel : lightModeLabel, className: currentMode === 'dark' ? 'deck-widget-moon' : 'deck-widget-sun' }), rootElement);
    }
    /**
     * Returns the current theme mode.
     * In controlled mode, returns the themeMode prop.
     * In uncontrolled mode, returns the internal state.
     */
    getThemeMode() {
        return this.props.themeMode ?? this.themeMode;
    }
    _handleClick() {
        const currentMode = this.getThemeMode();
        const nextMode = currentMode === 'dark' ? 'light' : 'dark';
        // Always call callback if provided
        this.props.onThemeModeChange?.(nextMode);
        // Only update internal state if uncontrolled
        if (this.props.themeMode === undefined) {
            this.themeMode = nextMode;
            this.updateHTML();
        }
        // In controlled mode, parent will update themeMode prop which triggers _applyTheme via setProps
    }
    /** Apply theme styling without changing internal state */
    _applyTheme(themeMode, rootElement) {
        const themeStyle = themeMode === 'dark' ? this.props.darkModeTheme : this.props.lightModeTheme;
        if (deepEqual(themeStyle, this.appliedTheme, 1)) {
            return;
        }
        const container = rootElement.closest('.deck-widget-container');
        if (!container)
            return;
        applyStyles(container, themeStyle);
        this.appliedTheme = themeStyle;
        const label = themeMode === 'dark' ? this.props.darkModeLabel : this.props.lightModeLabel;
        log.log(1, `Switched theme to ${label}`, themeStyle)();
    }
    /** Read browser preference */
    _getInitialThemeMode() {
        const { initialThemeMode } = this.props;
        if (initialThemeMode !== 'auto') {
            return initialThemeMode;
        }
        if (typeof window === 'undefined') {
            return 'light';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
}
ThemeWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'theme',
    placement: 'top-left',
    viewId: null,
    lightModeLabel: 'Light Mode',
    lightModeTheme: LightGlassTheme,
    darkModeLabel: 'Dark Mode',
    darkModeTheme: DarkGlassTheme,
    initialThemeMode: 'auto',
    themeMode: undefined,
    onThemeModeChange: () => { }
};
//# sourceMappingURL=theme-widget.js.map