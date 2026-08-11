import { cloneDeep, merge } from 'lodash-es';
export var defaultAnimationOffConfig = {
    node: false,
    edge: false,
};
export var defaultAnimationOnConfig = {
    node: true,
    edge: true,
};
export var setupAnimation = function (config) {
    if (!config || typeof config === 'boolean') {
        return config === true
            ? cloneDeep(defaultAnimationOnConfig)
            : cloneDeep(defaultAnimationOffConfig);
    }
    // 当传入的是对象时，将其与默认关合并
    return merge(cloneDeep(defaultAnimationOffConfig), config);
};
export var updateAnimation = setupAnimation;
