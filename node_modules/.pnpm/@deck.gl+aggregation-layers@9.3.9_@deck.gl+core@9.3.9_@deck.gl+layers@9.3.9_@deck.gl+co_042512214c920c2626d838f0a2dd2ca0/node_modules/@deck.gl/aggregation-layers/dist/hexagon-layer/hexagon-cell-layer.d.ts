import { Texture } from '@luma.gl/core';
import { UpdateParameters, Color } from '@deck.gl/core';
import { ColumnLayer } from '@deck.gl/layers';
import type { ScaleType } from "../common/types.js";
/** Proprties added by HexagonCellLayer. */
export type _HexagonCellLayerProps = {
    hexOriginCommon: Readonly<[number, number]>;
    colorDomain: Readonly<[number, number]>;
    colorCutoff: Readonly<[number, number]> | null;
    colorRange: Color[];
    colorScaleType: ScaleType;
    elevationDomain: Readonly<[number, number]>;
    elevationCutoff: Readonly<[number, number]> | null;
    elevationRange: Readonly<[number, number]>;
};
export default class HexagonCellLayer<ExtraPropsT extends {} = {}> extends ColumnLayer<null, ExtraPropsT & Required<_HexagonCellLayerProps>> {
    static layerName: string;
    state: ColumnLayer['state'] & {
        colorTexture: Texture;
    };
    getShaders(): any;
    initializeState(): void;
    updateState(params: UpdateParameters<this>): void;
    finalizeState(context: any): void;
    draw({ uniforms }: {
        uniforms: any;
    }): void;
}
//# sourceMappingURL=hexagon-cell-layer.d.ts.map