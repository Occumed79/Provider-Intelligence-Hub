import { Dom, ObjectExt, Util, Vector } from '../../common';
import { Config } from '../../config';
const defaultOptions = {
    padding: 3,
    rx: 0,
    ry: 0,
    attrs: {
        'stroke-width': 3,
        stroke: '#FEB663',
    },
};
export const stroke = {
    highlight(cellView, magnet, options) {
        const id = getHighlighterId(magnet, options);
        if (hasCache(id)) {
            return;
        }
        // eslint-disable-next-line
        options = ObjectExt.defaultsDeep({}, options, defaultOptions);
        const magnetVel = Vector.create(magnet);
        let pathData;
        let magnetBBox;
        try {
            pathData = magnetVel.toPathData();
        }
        catch (error) {
            // Failed to get path data from magnet element.
            // Draw a rectangle around the entire cell view instead.
            magnetBBox = Util.bbox(magnetVel.node, true);
            pathData = Dom.rectToPathData(Object.assign(Object.assign({}, options), magnetBBox));
        }
        const path = Dom.createSvgElement('path');
        Dom.attr(path, Object.assign({ d: pathData, 'pointer-events': 'none', 'vector-effect': 'non-scaling-stroke', fill: 'none' }, (options.attrs ? Dom.kebablizeAttrs(options.attrs) : null)));
        // const highlightVel = v.create('path').attr()
        if (cellView.isEdgeElement(magnet)) {
            Dom.attr(path, 'd', cellView.getConnectionPathData());
        }
        else {
            let highlightMatrix = magnetVel.getTransformToElement(cellView.container);
            // Add padding to the highlight element.
            const padding = options.padding;
            if (padding) {
                if (magnetBBox == null) {
                    magnetBBox = Util.bbox(magnetVel.node, true);
                }
                const cx = magnetBBox.x + magnetBBox.width / 2;
                const cy = magnetBBox.y + magnetBBox.height / 2;
                magnetBBox = Util.transformRectangle(magnetBBox, highlightMatrix);
                const width = Math.max(magnetBBox.width, 1);
                const height = Math.max(magnetBBox.height, 1);
                const sx = (width + padding) / width;
                const sy = (height + padding) / height;
                const paddingMatrix = Dom.createSVGMatrix({
                    a: sx,
                    b: 0,
                    c: 0,
                    d: sy,
                    e: cx - sx * cx,
                    f: cy - sy * cy,
                });
                highlightMatrix = highlightMatrix.multiply(paddingMatrix);
            }
            Dom.transform(path, highlightMatrix);
        }
        Dom.addClass(path, Config.prefix('highlight-stroke'));
        const cell = cellView.cell;
        const removeHandler = () => removeHighlighter(id);
        cell.on('removed', removeHandler);
        if (cell.model) {
            cell.model.on('reseted', removeHandler);
        }
        cellView.container.appendChild(path);
        setCache(id, path);
    },
    unhighlight(cellView, magnet, opt) {
        removeHighlighter(getHighlighterId(magnet, opt));
    },
};
function getHighlighterId(magnet, options) {
    Dom.ensureId(magnet);
    return magnet.id + JSON.stringify(options);
}
const cache = {};
function setCache(id, elem) {
    cache[id] = elem;
}
function hasCache(id) {
    return cache[id] != null;
}
function removeHighlighter(id) {
    const elem = cache[id];
    if (elem) {
        Dom.remove(elem);
        delete cache[id];
    }
}
//# sourceMappingURL=stroke.js.map