import LogicFlow from '../LogicFlow';
export declare const DEFAULT_GRID_SIZE = 10;
export declare const defaultTheme: LogicFlow.Theme;
export declare const retroTheme: LogicFlow.Theme;
export declare const darkTheme: LogicFlow.Theme;
export declare const colorfulTheme: LogicFlow.Theme;
export declare const themeModeMap: {
    default: LogicFlow.Theme;
    colorful: LogicFlow.Theme;
    dark: LogicFlow.Theme;
    retro: LogicFlow.Theme;
};
export declare const darkBackground: {
    background: string;
};
export declare const colorfulBackground: {
    background: string;
};
export declare const defaultBackground: {
    background: string;
};
export declare const retroBackground: {
    background: string;
};
export declare const backgroundModeMap: {
    colorful: {
        background: string;
    };
    dark: {
        background: string;
    };
    default: {
        background: string;
    };
    retro: {
        background: string;
    };
};
export declare const darkGrid: {
    size: number;
    visible: boolean;
    type: string;
    config: {
        color: string;
        thickness: number;
    };
    majorBold: boolean;
};
export declare const colorfulGrid: {
    size: number;
    visible: boolean;
    type: string;
    config: {
        color: string;
        thickness: number;
    };
    majorBold: boolean;
};
export declare const defaultGrid: {
    size: number;
    visible: boolean;
    type: string;
    config: {
        color: string;
        thickness: number;
    };
    majorBold: {
        opacity: number;
        boldIndices: number[];
        dashArrayConfig: {
            pattern: never[];
        };
        customBoldWidth: number;
    };
};
export declare const retroGrid: {
    size: number;
    visible: boolean;
    type: string;
    config: {
        color: string;
        thickness: number;
    };
    majorBold: boolean;
};
export declare const gridModeMap: {
    colorful: {
        size: number;
        visible: boolean;
        type: string;
        config: {
            color: string;
            thickness: number;
        };
        majorBold: boolean;
    };
    dark: {
        size: number;
        visible: boolean;
        type: string;
        config: {
            color: string;
            thickness: number;
        };
        majorBold: boolean;
    };
    retro: {
        size: number;
        visible: boolean;
        type: string;
        config: {
            color: string;
            thickness: number;
        };
        majorBold: boolean;
    };
    default: {
        size: number;
        visible: boolean;
        type: string;
        config: {
            color: string;
            thickness: number;
        };
        majorBold: {
            opacity: number;
            boldIndices: number[];
            dashArrayConfig: {
                pattern: never[];
            };
            customBoldWidth: number;
        };
    };
};
declare const _default: null;
export default _default;
