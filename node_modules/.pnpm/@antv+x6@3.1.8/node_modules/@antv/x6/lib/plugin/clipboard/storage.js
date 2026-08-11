"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = save;
exports.fetch = fetch;
exports.clean = clean;
const config_1 = require("../../config");
const model_1 = require("../../model");
const LOCAL_STORAGE_KEY = `${config_1.Config.prefixCls}.clipboard.cells`;
function save(cells) {
    if (window.localStorage) {
        const data = cells.map((cell) => cell.toJSON());
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
}
function fetch() {
    if (window.localStorage) {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        const cells = raw ? JSON.parse(raw) : [];
        if (cells) {
            return model_1.Model.fromJSON(cells);
        }
    }
}
function clean() {
    if (window.localStorage) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
}
//# sourceMappingURL=storage.js.map