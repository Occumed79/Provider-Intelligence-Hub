export declare const IS_MAC: boolean;
export declare const IS_IOS: boolean;
export declare const IS_WINDOWS: boolean;
export declare const IS_IE: boolean;
export declare const IS_IE11: boolean;
export declare const IS_EDGE: boolean;
/**
 * A flag indicating whether the browser is Netscape (including Firefox).
 */
export declare const IS_NETSCAPE: boolean;
/**
 * A flag indicating whether the the this is running inside a Chrome App.
 */
export declare const IS_CHROME_APP: boolean;
export declare const IS_CHROME: boolean;
export declare const IS_OPERA: boolean;
export declare const IS_FIREFOX: boolean;
export declare const IS_SAFARI: boolean;
/**
 * A flag indicating whether this device supports touchstart/-move/-end
 * events (Apple iOS, Android, Chromebook and Chrome Browser on touch-enabled
 * devices).
 */
export declare const SUPPORT_TOUCH: boolean;
/**
 * A flag indicating whether this device supports Microsoft pointer events.
 */
export declare const SUPPORT_POINTER: boolean;
export declare const SUPPORT_PASSIVE = false;
/**
 * A flag indicating whether foreignObject support is not available. This
 * is the case for Opera, older SVG-based browsers and all versions of IE.
 */
export declare const NO_FOREIGNOBJECT: boolean;
export declare const SUPPORT_FOREIGNOBJECT: boolean;
export declare function getHMRStatus(): any;
export declare function isApplyingHMR(): boolean;
export declare function isEventSupported(event: string): boolean;
