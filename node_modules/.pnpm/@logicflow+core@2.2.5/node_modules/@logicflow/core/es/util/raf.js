import { createUuid } from './uuid';
var rafIdMap = new Map();
export var createRaf = function (callback) {
    var rafId = createUuid();
    function run() {
        callback();
        var eId = rafIdMap.get(rafId);
        if (eId) {
            var nId = window.requestAnimationFrame(run);
            rafIdMap.set(rafId, nId);
        }
    }
    var id = window.requestAnimationFrame(run);
    rafIdMap.set(rafId, id);
    return rafId;
};
export var cancelRaf = function (rafId) {
    var eId = rafIdMap.get(rafId);
    if (eId) {
        window.cancelAnimationFrame(eId);
        rafIdMap.delete(rafId);
    }
};
