"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSManager = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const config_1 = require("../config");
const raw_1 = require("../style/raw");
const base_1 = require("./base");
class CSSManager extends base_1.Base {
    init() {
        if (config_1.Config.autoInsertCSS) {
            common_1.CssLoader.ensure('core', raw_1.content);
        }
    }
    dispose() {
        common_1.CssLoader.clean('core');
    }
}
exports.CSSManager = CSSManager;
tslib_1.__decorate([
    (0, common_1.disposable)()
], CSSManager.prototype, "dispose", null);
//# sourceMappingURL=css.js.map