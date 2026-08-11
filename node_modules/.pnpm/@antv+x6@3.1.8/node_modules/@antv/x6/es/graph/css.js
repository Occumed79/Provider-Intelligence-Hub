import { __decorate } from "tslib";
import { CssLoader, disposable } from '../common';
import { Config } from '../config';
import { content } from '../style/raw';
import { Base } from './base';
export class CSSManager extends Base {
    init() {
        if (Config.autoInsertCSS) {
            CssLoader.ensure('core', content);
        }
    }
    dispose() {
        CssLoader.clean('core');
    }
}
__decorate([
    disposable()
], CSSManager.prototype, "dispose", null);
//# sourceMappingURL=css.js.map