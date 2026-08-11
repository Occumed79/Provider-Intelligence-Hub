interface Config<Datum> {
    /** The data for the voronoi diagram */
    data?: Datum[];
    /** The total width of the voronoi diagram. */
    width?: number;
    /** The total width of the voronoi diagram. */
    height?: number;
    /** Set the x-value accessor function for the voronoi diagram. */
    x: (d: Datum) => number;
    /** Set the y-value accessor function for the voronoi diagram. */
    y: (d: Datum) => number;
}
/**
 * Returns a configured d3 voronoi diagram for the given data. See d3-delaunay
 * for the complete API reference.
 */
export default function voronoi<Datum>({ data, width, height, x, y }: Config<Datum>): import("@visx/vendor/d3-delaunay").Voronoi<Datum>;
export {};
//# sourceMappingURL=voronoi.d.ts.map