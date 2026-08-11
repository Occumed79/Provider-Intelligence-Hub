/** This file must only contain pure code and pure imports */
import { FlowGraphEventBlock } from "../../flowGraphEventBlock.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block that triggers when a scene is ready.
 */
export class FlowGraphSceneReadyEventBlock extends FlowGraphEventBlock {
    constructor() {
        super(...arguments);
        this.initPriority = -1;
        this.type = "SceneReady" /* FlowGraphEventType.SceneReady */;
    }
    _executeEvent(context, _payload) {
        this._execute(context);
        return true;
    }
    _preparePendingTasks(context) {
        // no-op
    }
    _cancelPendingTasks(context) {
        // no-op
    }
    /**
     * @returns class name of the block.
     */
    getClassName() {
        return "FlowGraphSceneReadyEventBlock" /* FlowGraphBlockNames.SceneReadyEvent */;
    }
}
let _Registered = false;
/**
 * Register side effects for flowGraphSceneReadyEventBlock.
 * Safe to call multiple times; only the first call has an effect.
 */
export function RegisterFlowGraphSceneReadyEventBlock() {
    if (_Registered) {
        return;
    }
    _Registered = true;
    RegisterClass("FlowGraphSceneReadyEventBlock" /* FlowGraphBlockNames.SceneReadyEvent */, FlowGraphSceneReadyEventBlock);
}
//# sourceMappingURL=flowGraphSceneReadyEventBlock.pure.js.map