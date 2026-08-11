"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTheme = exports.clearThemeMode = exports.removeThemeMode = exports.addThemeMode = exports.setupTheme = void 0;
var lodash_es_1 = require("lodash-es");
var theme_1 = require("../constant/theme");
/* 主题（全局样式）相关工具方法 */
var setupTheme = function (customTheme, themeMode) {
    var theme = (0, lodash_es_1.cloneDeep)(theme_1.themeModeMap[themeMode || 'default']) ||
        (0, lodash_es_1.cloneDeep)(theme_1.themeModeMap.default);
    if (customTheme) {
        /**
         * 为了不让默认样式被覆盖，使用 merge 方法
         * @docs https://lodash.com/docs/4.17.15#merge
         * 例如：锚点主题 hover，用户传入如下 ->
         * lf.setTheme({
         *   anchor: {
         *     fill: 'red'
         *   }
         * })
         *
         * 预期得到的结果如下：
         * {
         *   // ...
         *   anchor: {
         *     stroke: '#000',
         *     fill: 'red',
         *     r: 4,
         *     hover: {
         *       r: 10,
         *       fill: '#949494',
         *       fillOpacity: 0.5,
         *       stroke: '#949494',
         *     },
         *   },
         *   // ...
         * }
         */
        theme = (0, lodash_es_1.merge)(theme, customTheme);
    }
    return theme;
};
exports.setupTheme = setupTheme;
var addThemeMode = function (themeMode, style) {
    if (theme_1.themeModeMap[themeMode]) {
        console.warn("theme mode ".concat(themeMode, " already exists"));
        return;
    }
    theme_1.themeModeMap[themeMode] = style;
    theme_1.backgroundModeMap[themeMode] = style.background || theme_1.defaultBackground;
    theme_1.gridModeMap[themeMode] = style.grid || theme_1.defaultGrid;
};
exports.addThemeMode = addThemeMode;
var removeThemeMode = function (themeMode) {
    delete theme_1.themeModeMap[themeMode];
    delete theme_1.backgroundModeMap[themeMode];
    delete theme_1.gridModeMap[themeMode];
};
exports.removeThemeMode = removeThemeMode;
var clearThemeMode = function () {
    var resetTheme = {
        colorful: {},
        dark: {},
        retro: {},
        default: {},
    };
    (0, lodash_es_1.assign)(theme_1.themeModeMap, resetTheme);
    (0, lodash_es_1.assign)(theme_1.backgroundModeMap, resetTheme);
    (0, lodash_es_1.assign)(theme_1.gridModeMap, resetTheme);
};
exports.clearThemeMode = clearThemeMode;
/* 更新 theme 方法 */
exports.updateTheme = exports.setupTheme;
