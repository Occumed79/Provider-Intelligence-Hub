export declare function getConstructorForDataFormat(dataType: string): Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;
export declare const GL_TYPE_MAP: {
    [key: string]: number;
};
/**
 * Returns how many bytes a type occupies
 * @param dataType
 * @returns
 */
export declare function sizeOf(dataType: string): number;
export declare const STRING_ATTRIBUTE_TYPE = "String";
export declare const OBJECT_ID_ATTRIBUTE_TYPE = "Oid32";
export declare const FLOAT_64_TYPE = "Float64";
export declare const INT_16_ATTRIBUTE_TYPE = "Int16";
export declare enum COORDINATE_SYSTEM {
    /**
     * `LNGLAT` if rendering into a geospatial viewport, `CARTESIAN` otherwise
     */
    DEFAULT = -1,
    /**
     * Positions are interpreted as [lng, lat, elevation]
     * lng lat are degrees, elevation is meters. distances as meters.
     */
    LNGLAT = 1,
    /**
     * Positions are interpreted as meter offsets, distances as meters
     */
    METER_OFFSETS = 2,
    /**
     * Positions are interpreted as lng lat offsets: [deltaLng, deltaLat, elevation]
     * deltaLng, deltaLat are delta degrees, elevation is meters.
     * distances as meters.
     */
    LNGLAT_OFFSETS = 3,
    /**
     * Non-geospatial
     */
    CARTESIAN = 0
}
//# sourceMappingURL=constants.d.ts.map