"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Basecoat = void 0;
const tslib_1 = require("tslib");
const event_1 = require("../event");
const object_1 = require("../object");
const disposable_1 = require("./disposable");
class Basecoat extends event_1.Events {
    dispose() {
        this.off();
    }
}
exports.Basecoat = Basecoat;
tslib_1.__decorate([
    (0, disposable_1.disposable)()
], Basecoat.prototype, "dispose", null);
object_1.ObjectExt.applyMixins(Basecoat, disposable_1.Disposable);
//# sourceMappingURL=basecoat.js.map