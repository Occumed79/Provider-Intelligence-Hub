import { __decorate } from "tslib";
import { Events } from '../event';
import { ObjectExt } from '../object';
import { Disposable, disposable } from './disposable';
export class Basecoat extends Events {
    dispose() {
        this.off();
    }
}
__decorate([
    disposable()
], Basecoat.prototype, "dispose", null);
ObjectExt.applyMixins(Basecoat, Disposable);
//# sourceMappingURL=basecoat.js.map