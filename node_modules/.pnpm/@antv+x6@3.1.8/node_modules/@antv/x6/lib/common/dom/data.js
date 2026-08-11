"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = getData;
exports.setData = setData;
exports.data = data;
const string_1 = require("../string");
const dataset = new WeakMap();
function getData(elem, name) {
    const key = string_1.StringExt.camelCase(name);
    const cache = dataset.get(elem);
    if (cache) {
        return cache[key];
    }
}
function setData(elem, name, value) {
    const key = string_1.StringExt.camelCase(name);
    const cache = dataset.get(elem);
    if (cache) {
        cache[key] = value;
    }
    else {
        dataset.set(elem, {
            [key]: value,
        });
    }
}
function data(elem, name, value) {
    if (!name) {
        return dataset.get(elem);
    }
    if (typeof name === "string") {
        if (value === undefined) {
            return getData(elem, name);
        }
        setData(elem, name, value);
        return;
    }
    // eslint-disable-next-line
    for (const key in name) {
        data(elem, key, name[key]);
    }
}
//# sourceMappingURL=data.js.map