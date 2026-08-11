import PolyData from '../../interface-types/poly-data.js';
import TypedArray from '../../typed-array.js';
declare function polyDataTransferables(polyData: PolyData): Array<ArrayBuffer | TypedArray | null>;
export default polyDataTransferables;
