/** This file must only contain pure code and pure imports */
import { FlowGraphEventBlock } from "../../flowGraphEventBlock.js";
import { Logger } from "../../../Misc/logger.js";
import { getRichTypeByFlowGraphType } from "../../flowGraphRichTypes.pure.js";
import { FlowGraphCoordinator } from "../../flowGraphCoordinator.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * A block that receives a custom event.
 * It saves the event data in the data outputs, based on the provided eventData in the configuration. For example, if the event data is
 * `{ x: { type: RichTypeNumber }, y: { type: RichTypeNumber } }`, the block will have two data outputs: x and y.
 */
export class FlowGraphReceiveCustomEventBlock extends FlowGraphEventBlock {
    constructor(
    /**
     * the configuration of the block
     */
    config) {
        super(config);
        this.config = config;
        this.initPriority = 1;
        // use event data to register data outputs
        for (const key in this.config.eventData) {
            const entry = this.config.eventData[key];
            // Handle deserialized config where type may be a string typeName, a plain object
            // with a typeName property (from old JSON serialization), or a proper RichType instance.
            const typeKey = typeof entry.type === "string" ? entry.type : entry.type?.typeName;
            const richType = typeof entry.type?.serialize === "function" ? entry.type : getRichTypeByFlowGraphType(typeKey);
            entry.type = richType;
            this.registerDataOutput(key, richType);
        }
    }
    _preparePendingTasks(context) {
        const observable = context.configuration.coordinator.getCustomEventObservable(this.config.eventId);
        // check if we are not exceeding the max number of events
        if (observable && observable.hasObservers() && observable.observers.length > FlowGraphCoordinator.MaxEventsPerType) {
            this._reportError(context, `FlowGraphReceiveCustomEventBlock: Too many observers for event ${this.config.eventId}. Max is ${FlowGraphCoordinator.MaxEventsPerType}.`);
            return;
        }
        const eventObserver = observable.add((eventData) => {
            const keys = Object.keys(eventData);
            for (const key of keys) {
                this.getDataOutput(key)?.setValue(eventData[key], context);
            }
            this._execute(context);
        });
        context._setExecutionVariable(this, "_eventObserver", eventObserver);
    }
    _cancelPendingTasks(context) {
        const observable = context.configuration.coordinator.getCustomEventObservable(this.config.eventId);
        if (observable) {
            const eventObserver = context._getExecutionVariable(this, "_eventObserver", null);
            observable.remove(eventObserver);
        }
        else {
            Logger.Warn(`FlowGraphReceiveCustomEventBlock: Missing observable for event ${this.config.eventId}`);
        }
    }
    _executeEvent(_context, _payload) {
        return true;
    }
    serialize(serializationObject = {}) {
        super.serialize(serializationObject);
        // Override the eventData in config to store typeName strings instead of RichType instances
        const serializedEventData = {};
        for (const key in this.config.eventData) {
            serializedEventData[key] = { type: this.config.eventData[key].type.typeName };
        }
        serializationObject.config.eventData = serializedEventData;
    }
    /**
     * @returns class name of the block.
     */
    getClassName() {
        return "FlowGraphReceiveCustomEventBlock" /* FlowGraphBlockNames.ReceiveCustomEvent */;
    }
}
let _Registered = false;
/**
 * Register side effects for flowGraphReceiveCustomEventBlock.
 * Safe to call multiple times; only the first call has an effect.
 */
export function RegisterFlowGraphReceiveCustomEventBlock() {
    if (_Registered) {
        return;
    }
    _Registered = true;
    RegisterClass("FlowGraphReceiveCustomEventBlock" /* FlowGraphBlockNames.ReceiveCustomEvent */, FlowGraphReceiveCustomEventBlock);
}
//# sourceMappingURL=flowGraphReceiveCustomEventBlock.pure.js.map