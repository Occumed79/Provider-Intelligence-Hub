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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { isEmpty } from 'lodash-es';
import { map } from 'lodash-es';
var selected = null;
export function translateNodeData(nodeData, distance) {
    var _a, _b;
    nodeData.x += distance;
    nodeData.y += distance;
    if (!isEmpty(nodeData.text)) {
        nodeData.text.x += distance;
        nodeData.text.y += distance;
    }
    if (!isEmpty((_a = nodeData.properties) === null || _a === void 0 ? void 0 : _a._label)) {
        (_b = nodeData.properties) === null || _b === void 0 ? void 0 : _b._label.forEach(function (label) {
            label.x += distance;
            label.y += distance;
        });
    }
    return nodeData;
}
export function translateEdgeData(edgeData, distance) {
    if (edgeData.startPoint) {
        edgeData.startPoint.x += distance;
        edgeData.startPoint.y += distance;
    }
    if (edgeData.endPoint) {
        edgeData.endPoint.x += distance;
        edgeData.endPoint.y += distance;
    }
    if (edgeData.pointsList && edgeData.pointsList.length > 0) {
        edgeData.pointsList.forEach(function (point) {
            point.x += distance;
            point.y += distance;
        });
    }
    if (!isEmpty(edgeData.text)) {
        edgeData.text.x += distance;
        edgeData.text.y += distance;
    }
    return edgeData;
}
export function transformNodeData(nodeData, distance) {
    var x = nodeData.x, y = nodeData.y, text = nodeData.text;
    // 重新计算 text 的位置，保证粘贴后 text 位置和复制的原节点相对位置一致
    var nextText = text
        ? {
            x: text.x + distance,
            y: text.y + distance,
            value: text.value,
        }
        : undefined;
    return __assign(__assign({}, nodeData), { id: '', x: x + distance, y: y + distance, text: nextText });
}
export function transformEdgeData(edgeData, distance) {
    var startPoint = edgeData.startPoint, endPoint = edgeData.endPoint, pointsList = edgeData.pointsList, text = edgeData.text, edgeConfig = __rest(edgeData
    // 清除原始边的 id
    , ["startPoint", "endPoint", "pointsList", "text"]);
    // 清除原始边的 id
    edgeConfig.id = '';
    // 重新计算边的位置，包括 startPoint、endPoint、pointsList 以及 text
    // TODO: 看这个是否可以提出一个通用方法，用于重新计算边的位置
    var nextStartPoint = {
        x: startPoint.x + distance,
        y: startPoint.y + distance,
    };
    var nextEndPoint = {
        x: endPoint.x + distance,
        y: endPoint.y + distance,
    };
    var newPointsList = map(pointsList, function (point) {
        return {
            x: point.x + distance,
            y: point.y + distance,
        };
    });
    var nextText = text
        ? __assign(__assign({}, text), { x: text.x + distance, y: text.y + distance }) : undefined;
    return __assign(__assign({}, edgeConfig), { startPoint: nextStartPoint, endPoint: nextEndPoint, pointsList: newPointsList, text: nextText });
}
var TRANSLATION_DISTANCE = 40;
var CHILDREN_TRANSLATION_DISTANCE = 40;
export function initDefaultShortcut(lf, graph) {
    var keyboard = lf.keyboard;
    var keyboardOptions = keyboard.options.keyboard;
    // 复制
    keyboard.on(['cmd + c', 'ctrl + c'], function () {
        CHILDREN_TRANSLATION_DISTANCE = TRANSLATION_DISTANCE;
        if (!(keyboardOptions === null || keyboardOptions === void 0 ? void 0 : keyboardOptions.enabled))
            return true;
        if (graph.textEditElement)
            return true;
        var guards = lf.options.guards;
        var elements = graph.getSelectElements(false);
        var enabledClone = guards && guards.beforeClone ? guards.beforeClone(elements) : true;
        if (!enabledClone ||
            (elements.nodes.length === 0 && elements.edges.length === 0)) {
            selected = null;
            return true;
        }
        selected = elements;
        selected.nodes.forEach(function (node) {
            return translateNodeData(node, TRANSLATION_DISTANCE);
        });
        selected.edges.forEach(function (edge) {
            return translateEdgeData(edge, TRANSLATION_DISTANCE);
        });
        return false;
    });
    // 粘贴
    keyboard.on(['cmd + v', 'ctrl + v'], function () {
        if (!(keyboardOptions === null || keyboardOptions === void 0 ? void 0 : keyboardOptions.enabled))
            return true;
        if (graph.textEditElement)
            return true;
        if (selected && (selected.nodes || selected.edges)) {
            lf.clearSelectElements();
            var addElements = lf.addElements(selected, CHILDREN_TRANSLATION_DISTANCE);
            if (!addElements)
                return true;
            addElements.nodes.forEach(function (node) { return lf.selectElementById(node.id, true); });
            addElements.edges.forEach(function (edge) { return lf.selectElementById(edge.id, true); });
            selected.nodes.forEach(function (node) {
                return translateNodeData(node, TRANSLATION_DISTANCE);
            });
            selected.edges.forEach(function (edge) {
                return translateEdgeData(edge, TRANSLATION_DISTANCE);
            });
            CHILDREN_TRANSLATION_DISTANCE =
                CHILDREN_TRANSLATION_DISTANCE + TRANSLATION_DISTANCE;
        }
        return false;
    });
    // undo
    keyboard.on(['cmd + z', 'ctrl + z'], function () {
        if (!(keyboardOptions === null || keyboardOptions === void 0 ? void 0 : keyboardOptions.enabled))
            return true;
        if (graph.textEditElement)
            return true;
        lf.undo();
        return false;
    });
    // redo
    keyboard.on(['cmd + y', 'ctrl + y'], function () {
        if (!(keyboardOptions === null || keyboardOptions === void 0 ? void 0 : keyboardOptions.enabled))
            return true;
        if (graph.textEditElement)
            return true;
        lf.redo();
        return false;
    });
    // delete
    keyboard.on(['backspace'], function () {
        if (!(keyboardOptions === null || keyboardOptions === void 0 ? void 0 : keyboardOptions.enabled))
            return true;
        if (graph.textEditElement)
            return true;
        var elements = graph.getSelectElements(true);
        lf.clearSelectElements();
        elements.edges.forEach(function (edge) { return edge.id && lf.deleteEdge(edge.id); });
        elements.nodes.forEach(function (node) { return node.id && lf.deleteNode(node.id); });
        return false;
    });
}
