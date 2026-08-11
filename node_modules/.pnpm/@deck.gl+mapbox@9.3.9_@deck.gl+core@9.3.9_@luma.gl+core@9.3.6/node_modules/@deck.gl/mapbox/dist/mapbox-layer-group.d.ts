import type { Map, CustomLayerInterface } from "./types.js";
import { type Deck } from '@deck.gl/core';
type MapWithDeck = Map & {
    __deck: Deck;
};
export type MapboxLayerGroupProps = {
    id: string;
    renderingMode?: '2d' | '3d';
    slot?: 'bottom' | 'middle' | 'top';
    beforeId?: string;
};
export default class MapboxLayerGroup implements CustomLayerInterface {
    id: string;
    type: 'custom';
    renderingMode: '2d' | '3d';
    slot?: 'bottom' | 'middle' | 'top';
    beforeId?: string;
    map: MapWithDeck | null;
    constructor(props: MapboxLayerGroupProps);
    onAdd(map: MapWithDeck, gl: WebGL2RenderingContext): void;
    render(gl: any, renderParameters: any): void;
}
export {};
//# sourceMappingURL=mapbox-layer-group.d.ts.map