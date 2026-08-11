// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { drawLayerGroup } from "./deck-utils.js";
import { assert } from '@deck.gl/core';
export default class MapboxLayerGroup {
    /* eslint-disable no-this-before-super */
    constructor(props) {
        assert(props.id, 'id is required');
        this.id = props.id;
        this.type = 'custom';
        this.renderingMode = props.renderingMode || '3d';
        this.slot = props.slot;
        this.beforeId = props.beforeId;
        this.map = null;
    }
    /* Mapbox custom layer methods */
    onAdd(map, gl) {
        this.map = map;
    }
    render(gl, renderParameters) {
        if (!this.map)
            return;
        drawLayerGroup(this.map.__deck, this.map, this, renderParameters);
    }
}
//# sourceMappingURL=mapbox-layer-group.js.map