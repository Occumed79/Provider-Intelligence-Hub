import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Widget } from '@deck.gl/core';
import { FlyToInterpolator, LinearInterpolator } from '@deck.gl/core';
import { render } from 'preact';
import { DropdownMenu } from "./lib/components/dropdown-menu.js";
import { GeocoderHistory } from "./lib/geocode/geocoder-history.js";
import { GoogleGeocoder, MapboxGeocoder, OpenCageGeocoder, CoordinatesGeocoder, CurrentLocationGeocoder } from "./lib/geocode/geocoders.js";
const CURRENT_LOCATION = 'current';
// Location pin icon (from Google Material Symbols)
const LOCATION_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 -960 960 960'%3E%3Cpath d='M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Z'/%3E%3C/svg%3E`;
const CURRENT_LOCATION_ITEM = {
    label: 'Current location',
    value: CURRENT_LOCATION,
    icon: LOCATION_ICON
};
/**
 * A widget that display a text box that lets user type in a location
 * and a button that moves the view to that location.
 * @todo For now only supports coordinates, Could be extended with location service integrations.
 */
export class GeocoderWidget extends Widget {
    constructor(props = {}) {
        super(props);
        this.className = 'deck-widget-geocoder';
        this.placement = 'top-left';
        this.geocodeHistory = new GeocoderHistory({});
        this.addressText = '';
        this.geocoder = CoordinatesGeocoder;
        this.isGettingLocation = false;
        this.setInput = (text) => {
            this.addressText = text;
        };
        this.handleKeyPress = e => {
            if (e.key === 'Enter') {
                this.handleSubmit();
            }
        };
        this.handleSelect = (value) => {
            if (value === CURRENT_LOCATION) {
                // Don't put "current" in the text field, just trigger geolocation
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.getCurrentLocation();
            }
            else {
                this.setInput(value);
                this.handleSubmit();
            }
        };
        /** Sync wrapper for async geocode() */
        this.handleSubmit = () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.geocode(this.addressText);
        };
        /** Get current location via browser geolocation API */
        this.getCurrentLocation = async () => {
            this.isGettingLocation = true;
            if (this.rootElement) {
                this.updateHTML();
            }
            try {
                const coordinates = await CurrentLocationGeocoder.geocode();
                if (coordinates) {
                    this.flyTo(coordinates);
                }
            }
            catch (error) {
                this.geocodeHistory.errorText = error instanceof Error ? error.message : 'Location error';
            }
            finally {
                this.isGettingLocation = false;
                if (this.rootElement) {
                    this.updateHTML();
                }
            }
        };
        /** Perform geocoding */
        this.geocode = async (address) => {
            const coordinates = await this.geocodeHistory.geocode(this.geocoder, this.addressText, this.props.apiKey);
            // Re-render to show updated history or error (guard against torn-down widget)
            if (this.rootElement) {
                this.updateHTML();
            }
            if (coordinates) {
                this.flyTo(coordinates);
            }
        };
        this.setProps(this.props);
    }
    setProps(props) {
        this.placement = props.placement ?? this.placement;
        this.viewId = props.viewId ?? this.viewId;
        this.geocoder = getGeocoder(this.props);
        if (this.geocoder.requiresApiKey && !this.props.apiKey) {
            throw new Error(`API key is required for the ${this.geocoder.name} geocoder`);
        }
        super.setProps(props);
    }
    onRenderHTML(rootElement) {
        const menuItems = this.props._geolocation
            ? [CURRENT_LOCATION_ITEM, ...this.geocodeHistory.addressHistory]
            : [...this.geocodeHistory.addressHistory];
        render(_jsxs("div", { className: "deck-widget-geocoder", children: [_jsx("input", { className: "deck-widget-geocoder-input", type: "text", placeholder: this.isGettingLocation
                        ? 'Finding your location...'
                        : (this.geocoder.placeholderLocation ?? 'Enter address or location'), value: this.geocodeHistory.addressText, 
                    // @ts-expect-error event type
                    onInput: e => this.setInput(e.target?.value || ''), onKeyPress: this.handleKeyPress }), _jsx(DropdownMenu, { menuItems: menuItems, onSelect: this.handleSelect }), this.geocodeHistory.errorText && (_jsx("div", { className: "deck-widget-geocoder-error", children: this.geocodeHistory.errorText }))] }), rootElement);
    }
    flyTo(viewState) {
        for (const viewId of this.viewIds) {
            // Call callback with geocoded coordinates
            if ('longitude' in viewState && 'latitude' in viewState) {
                this.props.onGeocode?.({
                    viewId,
                    coordinates: {
                        longitude: viewState.longitude,
                        latitude: viewState.latitude,
                        zoom: viewState.zoom
                    }
                });
            }
            const currentViewState = this.getViewState(viewId);
            const nextViewState = {
                ...currentViewState,
                ...viewState
            };
            if (this.props.transitionDuration > 0) {
                nextViewState.transitionDuration = this.props.transitionDuration;
                nextViewState.transitionInterpolator =
                    'latitude' in nextViewState ? new FlyToInterpolator() : new LinearInterpolator();
            }
            this.setViewState(viewId, nextViewState);
        }
    }
}
GeocoderWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'geocoder',
    viewId: null,
    placement: 'top-left',
    label: 'Geocoder',
    transitionDuration: 200,
    geocoder: 'coordinates',
    customGeocoder: CoordinatesGeocoder,
    apiKey: '',
    _geolocation: false,
    onGeocode: () => { }
};
function getGeocoder(props) {
    switch (props.geocoder) {
        case 'google':
            return GoogleGeocoder;
        case 'mapbox':
            return MapboxGeocoder;
        case 'opencage':
            return OpenCageGeocoder;
        case 'coordinates':
            return CoordinatesGeocoder;
        case 'custom':
            if (!props.customGeocoder) {
                throw new Error('Custom geocoder is not defined');
            }
            return props.customGeocoder;
        default:
            throw new Error(`Unknown geocoder: ${props.geocoder}`);
    }
}
//# sourceMappingURL=geocoder-widget.js.map