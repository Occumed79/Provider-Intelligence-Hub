import { TypedArray } from '@loaders.gl/schema';
type Attribute = string[] | TypedArray | null;
export type I3STileAttributes = Record<string, Attribute>;
/**
 * Get particular tile and creates attribute object inside.
 * @param  arrayBuffer
 * @param {Object} options
 * @returns {Promise<object>}
 */
export declare function parseI3STileAttribute(arrayBuffer: ArrayBuffer, options: any): I3STileAttributes;
export {};
//# sourceMappingURL=parse-i3s-attribute.d.ts.map