"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CASE_SENSITIVE_ATTR = void 0;
exports.getAttribute = getAttribute;
exports.removeAttribute = removeAttribute;
exports.setAttribute = setAttribute;
exports.setAttributes = setAttributes;
exports.attr = attr;
exports.qualifyAttr = qualifyAttr;
exports.kebablizeAttrs = kebablizeAttrs;
exports.styleToObject = styleToObject;
exports.mergeAttrs = mergeAttrs;
const elem_1 = require("./elem");
const format_1 = require("../string/format");
exports.CASE_SENSITIVE_ATTR = [
    'viewBox',
    'attributeName',
    'attributeType',
    'repeatCount',
    'textLength',
    'lengthAdjust',
    'gradientUnits',
    'preserveAspectRatio',
];
function getAttribute(elem, name) {
    return elem.getAttribute(name);
}
function removeAttribute(elem, name) {
    const qualified = qualifyAttr(name);
    if (qualified.ns) {
        if (elem.hasAttributeNS(qualified.ns, qualified.local)) {
            elem.removeAttributeNS(qualified.ns, qualified.local);
        }
    }
    else if (elem.hasAttribute(name)) {
        elem.removeAttribute(name);
    }
}
function setAttribute(elem, name, value) {
    if (value == null) {
        return removeAttribute(elem, name);
    }
    const qualified = qualifyAttr(name);
    if (qualified.ns && typeof value === 'string') {
        elem.setAttributeNS(qualified.ns, name, value);
    }
    else if (name === 'id') {
        elem.id = `${value}`;
    }
    else {
        elem.setAttribute(name, `${value}`);
    }
}
function setAttributes(elem, attrs) {
    Object.keys(attrs).forEach((name) => {
        setAttribute(elem, name, attrs[name]);
    });
}
function attr(elem, name, value) {
    if (name == null) {
        const attrs = elem.attributes;
        const ret = {};
        for (let i = 0; i < attrs.length; i += 1) {
            ret[attrs[i].name] = attrs[i].value;
        }
        return ret;
    }
    if (typeof name === 'string' && value === undefined) {
        return elem.getAttribute(name);
    }
    if (typeof name === 'object') {
        setAttributes(elem, name);
    }
    else {
        setAttribute(elem, name, value);
    }
}
function qualifyAttr(name) {
    if (name.indexOf(':') !== -1) {
        const combinedKey = name.split(':');
        return {
            ns: elem_1.ns[combinedKey[0]],
            local: combinedKey[1],
        };
    }
    return {
        ns: null,
        local: name,
    };
}
function kebablizeAttrs(attrs) {
    const result = {};
    Object.keys(attrs).forEach((key) => {
        const name = exports.CASE_SENSITIVE_ATTR.includes(key) ? key : (0, format_1.kebabCase)(key);
        result[name] = attrs[key];
    });
    return result;
}
function styleToObject(styleString) {
    const ret = {};
    const styles = styleString.split(';');
    styles.forEach((item) => {
        const section = item.trim();
        if (section) {
            const pair = section.split('=');
            if (pair.length) {
                ret[pair[0].trim()] = pair[1] ? pair[1].trim() : '';
            }
        }
    });
    return ret;
}
function mergeAttrs(target, source) {
    Object.keys(source).forEach((attr) => {
        if (attr === 'class') {
            target[attr] = target[attr]
                ? `${target[attr]} ${source[attr]}`
                : source[attr];
        }
        else if (attr === 'style') {
            const to = typeof target[attr] === 'object';
            const so = typeof source[attr] === 'object';
            let tt;
            let ss;
            if (to && so) {
                tt = target[attr];
                ss = source[attr];
            }
            else if (to) {
                tt = target[attr];
                ss = styleToObject(source[attr]);
            }
            else if (so) {
                tt = styleToObject(target[attr]);
                ss = source[attr];
            }
            else {
                tt = styleToObject(target[attr]);
                ss = styleToObject(source[attr]);
            }
            target[attr] = mergeAttrs(tt, ss);
        }
        else {
            target[attr] = source[attr];
        }
    });
    return target;
}
//# sourceMappingURL=attr.js.map