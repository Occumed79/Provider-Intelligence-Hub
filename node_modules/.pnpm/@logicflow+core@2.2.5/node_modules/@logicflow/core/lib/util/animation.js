"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAnimation = exports.setupAnimation = exports.defaultAnimationOnConfig = exports.defaultAnimationOffConfig = void 0;
var lodash_es_1 = require("lodash-es");
exports.defaultAnimationOffConfig = {
    node: false,
    edge: false,
};
exports.defaultAnimationOnConfig = {
    node: true,
    edge: true,
};
var setupAnimation = function (config) {
    if (!config || typeof config === 'boolean') {
        return config === true
            ? (0, lodash_es_1.cloneDeep)(exports.defaultAnimationOnConfig)
            : (0, lodash_es_1.cloneDeep)(exports.defaultAnimationOffConfig);
    }
    // 当传入的是对象时，将其与默认关合并
    return (0, lodash_es_1.merge)((0, lodash_es_1.cloneDeep)(exports.defaultAnimationOffConfig), config);
};
exports.setupAnimation = setupAnimation;
exports.updateAnimation = exports.setupAnimation;
