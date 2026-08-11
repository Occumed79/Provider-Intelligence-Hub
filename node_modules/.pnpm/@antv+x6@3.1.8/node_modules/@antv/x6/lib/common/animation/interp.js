"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = exports.color = exports.unit = exports.object = exports.number = void 0;
/**
 * @file 插值函数
 * 提供数字、对象、单位、颜色、transform的插值函数。
 */
const util_1 = require("./util");
const number = (a, b) => {
    const d = b - a;
    return (t) => {
        return a + d * t;
    };
};
exports.number = number;
const object = (a, b) => {
    const keys = Object.keys(a);
    return (t) => {
        const ret = {};
        for (let i = keys.length - 1; i !== -1; i -= 1) {
            const key = keys[i];
            ret[key] = a[key] + (b[key] - a[key]) * t;
        }
        return ret;
    };
};
exports.object = object;
const unit = (a, b) => {
    const reg = util_1.unitReg;
    const ma = reg.exec(a);
    const mb = reg.exec(b);
    const pb = mb ? mb[1] : '';
    const aa = ma ? +ma[1] : 0;
    const bb = mb ? +mb[1] : 0;
    const index = pb.indexOf('.');
    const precision = index > 0 ? pb[1].length - index - 1 : 0;
    const d = bb - aa;
    const u = ma ? ma[2] : '';
    return (t) => {
        return (aa + d * t).toFixed(precision) + u;
    };
};
exports.unit = unit;
const color = (a, b) => {
    const ca = parseInt(a.slice(1), 16);
    const cb = parseInt(b.slice(1), 16);
    const ra = ca & 0x0000ff;
    const rd = (cb & 0x0000ff) - ra;
    const ga = ca & 0x00ff00;
    const gd = (cb & 0x00ff00) - ga;
    const ba = ca & 0xff0000;
    const bd = (cb & 0xff0000) - ba;
    return (t) => {
        const r = (ra + rd * t) & 0x000000ff;
        const g = (ga + gd * t) & 0x0000ff00;
        const b = (ba + bd * t) & 0x00ff0000;
        return `#${((1 << 24) | r | g | b).toString(16).slice(1)}`;
    };
};
exports.color = color;
const transform = (a, b) => {
    // 解析 transform 字符串中的函数和参数
    const parseTransform = (str) => {
        const result = [];
        if (!str)
            return result;
        const regex = /(\w+)\(([^)]+)\)/g;
        let match = regex.exec(str);
        while (match !== null) {
            if (match[1] && match[2]) {
                result.push({
                    name: match[1],
                    values: match[2].split(/\s*,\s*/).filter(Boolean),
                });
            }
            match = regex.exec(str);
        }
        return result;
    };
    const from = parseTransform(a);
    const to = parseTransform(b);
    if (from.length === 0 || to.length === 0) {
        return () => a; // 如果无法解析，返回初始值
    }
    return (t) => {
        const transforms = [];
        // 对每个 transform 函数进行插值
        for (let i = 0; i < Math.min(from.length, to.length); i++) {
            const fromFunc = from[i];
            const toFunc = to[i];
            if (!fromFunc || !toFunc)
                continue;
            if (fromFunc.name === toFunc.name &&
                fromFunc.values.length > 0 &&
                fromFunc.values.length === toFunc.values.length) {
                const values = [];
                // 对每个参数进行插值
                for (let j = 0; j < fromFunc.values.length; j++) {
                    const fromVal = fromFunc.values[j];
                    const toVal = toFunc.values[j];
                    if (fromVal === undefined || toVal === undefined)
                        continue;
                    // 检查是否是带单位的值
                    if (util_1.unitReg.test(fromVal) || util_1.unitReg.test(toVal)) {
                        // 使用 unit 插值函数处理带单位的值
                        const interpolate = (0, exports.unit)(fromVal, toVal);
                        values.push(interpolate(t));
                    }
                    else if (!Number.isNaN(parseFloat(fromVal)) &&
                        !Number.isNaN(parseFloat(toVal))) {
                        // 使用 number 插值函数处理纯数字
                        const interpolate = (0, exports.number)(parseFloat(fromVal), parseFloat(toVal));
                        values.push(interpolate(t).toString());
                    }
                    else {
                        // 无法解析的值保持原样
                        values.push(fromVal);
                    }
                }
                if (values.length > 0) {
                    transforms.push(`${fromFunc.name}(${values.join(', ')})`);
                }
            }
        }
        return transforms.length > 0 ? transforms.join(' ') : a;
    };
};
exports.transform = transform;
//# sourceMappingURL=interp.js.map