var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
export var defaultGridConfig = {
    opacity: 1,
    boldIndices: [5],
    dashArrayConfig: {
        pattern: [2, 1],
    },
    customBoldWidth: 2,
};
/**
 * 校验并规范化 GridConfig。
 * - 将 opacity 限制在 [0,1] 范围
 * - boldIndices 过滤为正整数并去重
 */
export function validateGridConfig(cfg) {
    var e_1, _a;
    var _b, _c;
    var opacity = Math.max(0, Math.min(1, (_b = cfg.opacity) !== null && _b !== void 0 ? _b : defaultGridConfig.opacity));
    var boldIndicesSet = new Set();
    var boldRaw = Array.isArray(cfg.boldIndices)
        ? cfg.boldIndices
        : defaultGridConfig.boldIndices;
    try {
        for (var boldRaw_1 = __values(boldRaw), boldRaw_1_1 = boldRaw_1.next(); !boldRaw_1_1.done; boldRaw_1_1 = boldRaw_1.next()) {
            var n = boldRaw_1_1.value;
            if (typeof n === 'number' && Number.isFinite(n) && n > 0) {
                boldIndicesSet.add(Math.floor(n));
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (boldRaw_1_1 && !boldRaw_1_1.done && (_a = boldRaw_1.return)) _a.call(boldRaw_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var boldIndices = Array.from(boldIndicesSet);
    var pattern = Array.isArray((_c = cfg.dashArrayConfig) === null || _c === void 0 ? void 0 : _c.pattern)
        ? cfg.dashArrayConfig.pattern
        : defaultGridConfig.dashArrayConfig.pattern;
    var dashArrayConfig = {
        pattern: pattern,
    };
    var customBoldWidth = cfg.customBoldWidth;
    return {
        opacity: opacity,
        boldIndices: boldIndices.length
            ? boldIndices
            : defaultGridConfig.boldIndices,
        dashArrayConfig: dashArrayConfig,
        customBoldWidth: customBoldWidth,
    };
}
/**
 * 合并用户行为配置与默认值。
 * - false → 关闭模式：opacity=1，bold=[]，关闭虚线
 * - true → 默认模式：采用 defaultGridConfig
 * - object → 自定义模式：校验后使用用户配置
 */
export function mergeMajorBoldConfig(input) {
    if (input === false) {
        return {
            mode: 'disabled',
            config: {
                opacity: 1,
                boldIndices: [],
                dashArrayConfig: {
                    pattern: [],
                },
            },
        };
    }
    if (input === true || input == null) {
        return { mode: 'default', config: __assign({}, defaultGridConfig) };
    }
    return { mode: 'custom', config: validateGridConfig(input) };
}
