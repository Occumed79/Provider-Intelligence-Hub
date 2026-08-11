import LogicFlow from '../LogicFlow';
export declare const setupTheme: (customTheme?: Partial<LogicFlow.Theme>, themeMode?: LogicFlow.ThemeMode | string) => LogicFlow.Theme;
export declare const addThemeMode: (themeMode: string, style: Partial<LogicFlow.Theme>) => void;
export declare const removeThemeMode: (themeMode: string) => void;
export declare const clearThemeMode: () => void;
export declare const updateTheme: (customTheme?: Partial<LogicFlow.Theme>, themeMode?: LogicFlow.ThemeMode | string) => LogicFlow.Theme;
