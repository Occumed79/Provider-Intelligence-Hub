import { Widget } from '@deck.gl/core';
import type { WidgetPlacement, WidgetProps } from '@deck.gl/core';
import { type Geocoder } from "./lib/geocode/geocoder.js";
import { GeocoderHistory } from "./lib/geocode/geocoder-history.js";
/** @todo - is the the best we can do? */
type ViewState = Record<string, unknown>;
/** Properties for the GeocoderWidget */
export type GeocoderWidgetProps = WidgetProps & {
    viewId?: string | null;
    /** Widget positioning within the view. Default 'top-left'. */
    placement?: WidgetPlacement;
    /** Tooltip message */
    label?: string;
    /** View state reset transition duration in ms. 0 disables the transition */
    transitionDuration?: number;
    /** Geocoding service selector, for declarative usage */
    geocoder?: 'google' | 'mapbox' | 'opencage' | 'coordinates' | 'custom';
    /** Custom geocoding service (Used when geocoder = 'custom') */
    customGeocoder?: Geocoder;
    /** API key used for geocoding services */
    apiKey?: string;
    /** Whether to use geolocation @note Experimental*/
    _geolocation?: boolean;
    /**
     * Callback when a location is geocoded and the view will navigate to it.
     */
    onGeocode?: (params: {
        /** The view being updated */
        viewId: string;
        /** The geocoded coordinates */
        coordinates: {
            longitude: number;
            latitude: number;
            zoom?: number;
        };
    }) => void;
};
/**
 * A widget that display a text box that lets user type in a location
 * and a button that moves the view to that location.
 * @todo For now only supports coordinates, Could be extended with location service integrations.
 */
export declare class GeocoderWidget extends Widget<GeocoderWidgetProps> {
    static defaultProps: Required<GeocoderWidgetProps>;
    className: string;
    placement: WidgetPlacement;
    geocodeHistory: GeocoderHistory;
    addressText: string;
    geocoder: Geocoder;
    isGettingLocation: boolean;
    constructor(props?: GeocoderWidgetProps);
    setProps(props: Partial<GeocoderWidgetProps>): void;
    onRenderHTML(rootElement: HTMLElement): void;
    setInput: (text: string) => void;
    handleKeyPress: (e: any) => void;
    handleSelect: (value: string) => void;
    /** Sync wrapper for async geocode() */
    handleSubmit: () => void;
    /** Get current location via browser geolocation API */
    getCurrentLocation: () => Promise<void>;
    /** Perform geocoding */
    geocode: (address: string) => Promise<void>;
    flyTo(viewState: ViewState): void;
}
export {};
//# sourceMappingURL=geocoder-widget.d.ts.map