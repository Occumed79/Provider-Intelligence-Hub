/** This file must only contain pure code and pure imports */
import { FlowGraphBlock } from "../../../flowGraphBlock.js";
import { RichTypeAny } from "../../../flowGraphRichTypes.pure.js";
import { FlowGraphInteger } from "../../../CustomTypes/flowGraphInteger.pure.js";
import { getNumericValue } from "../../../utils.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
/**
 * This simple Util block takes an array as input and selects a single element from it.
 */
export class FlowGraphArrayIndexBlock extends FlowGraphBlock {
    /**
     * Construct a FlowGraphArrayIndexBlock.
     * @param config construction parameters
     */
    constructor(config) {
        super(config);
        this.config = config;
        this.array = this.registerDataInput("array", RichTypeAny);
        this.index = this.registerDataInput("index", RichTypeAny, new FlowGraphInteger(-1));
        this.value = this.registerDataOutput("value", RichTypeAny);
    }
    /**
     * @internal
     */
    _updateOutputs(context) {
        const array = this.array.getValue(context);
        const index = getNumericValue(this.index.getValue(context));
        if (array && index >= 0 && index < array.length) {
            this.value.setValue(array[index], context);
        }
        else {
            this.value.setValue(null, context);
        }
    }
    /**
     * Serializes this block
     * @param serializationObject the object to serialize to
     */
    serialize(serializationObject) {
        super.serialize(serializationObject);
    }
    getClassName() {
        return "FlowGraphArrayIndexBlock" /* FlowGraphBlockNames.ArrayIndex */;
    }
}
let _Registered = false;
/**
 * Register side effects for flowGraphArrayIndexBlock.
 * Safe to call multiple times; only the first call has an effect.
 */
export function RegisterFlowGraphArrayIndexBlock() {
    if (_Registered) {
        return;
    }
    _Registered = true;
    RegisterClass("FlowGraphArrayIndexBlock" /* FlowGraphBlockNames.ArrayIndex */, FlowGraphArrayIndexBlock);
}
//# sourceMappingURL=flowGraphArrayIndexBlock.pure.js.map