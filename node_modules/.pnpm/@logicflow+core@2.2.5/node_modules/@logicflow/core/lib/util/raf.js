"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelRaf = exports.createRaf = void 0;
var uuid_1 = require("./uuid");
var rafIdMap = new Map();
var createRaf = function (callback) {
    var rafId = (0, uuid_1.createUuid)();
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
exports.createRaf = createRaf;
var cancelRaf = function (rafId) {
    var eId = rafIdMap.get(rafId);
    if (eId) {
        window.cancelAnimationFrame(eId);
        rafIdMap.delete(rafId);
    }
};
exports.cancelRaf = cancelRaf;
