import { RegisterClass } from "../../../Misc/typeStore.js";
import { FlowGraphKeyboardEventBlock } from "./flowGraphKeyboardEventBlock.js";
/**
 * A keyboard event block that fires when a key is released.
 * Inherits all inputs/outputs from {@link FlowGraphKeyboardEventBlock}.
 */
export class FlowGraphKeyUpEventBlock extends FlowGraphKeyboardEventBlock {
    /**
     * Creates a new FlowGraphKeyUpEventBlock.
     * @param config optional configuration
     */
    constructor(config) {
        super(config);
        /** @internal */
        this.type = "KeyUp" /* FlowGraphEventType.KeyUp */;
    }
    /**
     * @returns class name of the block.
     */
    getClassName() {
        return "FlowGraphKeyUpEventBlock" /* FlowGraphBlockNames.KeyUpEvent */;
    }
}
RegisterClass("FlowGraphKeyUpEventBlock" /* FlowGraphBlockNames.KeyUpEvent */, FlowGraphKeyUpEventBlock);
//# sourceMappingURL=flowGraphKeyUpEventBlock.js.map