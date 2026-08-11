"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hook_1 = require("./hook");
const util_1 = require("./util");
// Prevent triggered image.load events from bubbling to window.load
(0, hook_1.register)('load', {
    noBubble: true,
});
// Support: Chrome <=73+
// Chrome doesn't alert on `event.preventDefault()`
// as the standard mandates.
(0, hook_1.register)('beforeunload', {
    postDispatch(elem, event) {
        if (event.result !== undefined && event.originalEvent) {
            event.originalEvent.returnValue = event.result;
        }
    },
});
// For mouseenter/leave call the handler if related is outside the target.
// NB: No relatedTarget if the mouse left/entered the browser window
(0, hook_1.register)('mouseenter', {
    delegateType: 'mouseover',
    bindType: 'mouseover',
    handle(target, event) {
        let ret;
        const related = event.relatedTarget;
        const handleObj = event.handleObj;
        if (!related || (related !== target && !(0, util_1.contains)(target, related))) {
            event.type = handleObj.originType;
            ret = handleObj.handler.call(target, event);
            event.type = 'mouseover';
        }
        return ret;
    },
});
(0, hook_1.register)('mouseleave', {
    delegateType: 'mouseout',
    bindType: 'mouseout',
    handle(target, event) {
        let ret;
        const related = event.relatedTarget;
        const handleObj = event.handleObj;
        if (!related || (related !== target && !(0, util_1.contains)(target, related))) {
            event.type = handleObj.originType;
            ret = handleObj.handler.call(target, event);
            event.type = 'mouseout';
        }
        return ret;
    },
});
//# sourceMappingURL=special.js.map