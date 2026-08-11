/** This file must only contain pure code and pure imports */
import { FlowGraphExecutionBlockWithOutSignal } from "../../../flowGraphExecutionBlockWithOutSignal.js";
import { RichTypeAny, RichTypeFlowGraphInteger, RichTypeNumber } from "../../../flowGraphRichTypes.pure.js";
import { getNumericValue } from "../../../utils.js";
import { FlowGraphInteger } from "../../../CustomTypes/flowGraphInteger.pure.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
/**
 * Block that executes an action in a loop.
 */
export class FlowGraphForLoopBlock extends FlowGraphExecutionBlockWithOutSignal {
    constructor(config) {
        super(config);
        this.startIndex = this.registerDataInput("startIndex", RichTypeAny, 0);
        this.endIndex = this.registerDataInput("endIndex", RichTypeAny);
        this.step = this.registerDataInput("step", RichTypeNumber, 1);
        this.index = this.registerDataOutput("index", RichTypeFlowGraphInteger, new FlowGraphInteger(getNumericValue(config?.initialIndex ?? 0)));
        this.executionFlow = this._registerSignalOutput("executionFlow");
        this.completed = this._registerSignalOutput("completed");
        this._unregisterSignalOutput("out");
    }
    /**
     * @internal
     */
    _execute(context) {
        const index = getNumericValue(this.startIndex.getValue(context));
        const step = this.step.getValue(context);
        let endIndex = getNumericValue(this.endIndex.getValue(context));
        for (let i = index; i < endIndex; i += step) {
            this.index.setValue(new FlowGraphInteger(i), context);
            this.executionFlow._activateSignal(context);
            endIndex = getNumericValue(this.endIndex.getValue(context));
            if (i > FlowGraphForLoopBlock.MaxLoopIterations * step) {
                break;
            }
        }
        if (this.config?.incrementIndexWhenLoopDone) {
            this.index.setValue(new FlowGraphInteger(getNumericValue(this.index.getValue(context)) + step), context);
        }
        this.completed._activateSignal(context);
    }
    /**
     * @returns class name of the block.
     */
    getClassName() {
        return "FlowGraphForLoopBlock" /* FlowGraphBlockNames.ForLoop */;
    }
}
/**
 * The maximum number of iterations allowed for the loop.
 * If the loop exceeds this number, it will stop. This number is configurable to avoid infinite loops.
 */
FlowGraphForLoopBlock.MaxLoopIterations = 1000;
let _Registered = false;
/**
 * Register side effects for flowGraphForLoopBlock.
 * Safe to call multiple times; only the first call has an effect.
 */
export function RegisterFlowGraphForLoopBlock() {
    if (_Registered) {
        return;
    }
    _Registered = true;
    RegisterClass("FlowGraphForLoopBlock" /* FlowGraphBlockNames.ForLoop */, FlowGraphForLoopBlock);
}
//# sourceMappingURL=flowGraphForLoopBlock.pure.js.map