var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
/**
 * 判断一个点是否在指定区域
 * @param point 当前点
 * @param leftTopPoint 区域左上角点
 * @param rightBottomPoint 区域的右下角点
 */
export var isPointInArea = function (_a, _b, _c) {
    var _d = __read(_a, 2), x = _d[0], y = _d[1];
    var _e = __read(_b, 2), leftTopX = _e[0], leftTopY = _e[1];
    var _f = __read(_c, 2), rightBottomX = _f[0], rightBottomY = _f[1];
    return x > leftTopX && x < rightBottomX && y > leftTopY && y < rightBottomY;
};
/**
 * 判断鼠标点击选中元素的时候，是否为多选
 */
export var isMultipleSelect = function (e, editConfigModel) {
    var multipleSelectKey = editConfigModel.multipleSelectKey;
    var isMultiple = false;
    switch (multipleSelectKey) {
        case 'meta':
            isMultiple = e.metaKey;
            break;
        case 'alt':
            isMultiple = e.altKey;
            break;
        case 'shift':
            isMultiple = e.shiftKey;
            break;
        case 'ctrl':
            isMultiple = e.ctrlKey; // Mac上ctrl + 点击节点会触发上下文菜单，所以ctrl尽量用在非Mac系统
            break;
        default:
            isMultiple = false;
            break;
    }
    return isMultiple;
};
