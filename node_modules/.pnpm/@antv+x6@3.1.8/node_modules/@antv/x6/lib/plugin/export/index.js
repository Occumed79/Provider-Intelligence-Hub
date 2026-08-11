"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Export = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const geometry_1 = require("../../geometry");
require("./api");
class Export extends common_1.Basecoat {
    constructor() {
        super(...arguments);
        this.name = 'export';
    }
    get view() {
        return this.graph.view;
    }
    init(graph) {
        this.graph = graph;
    }
    exportPNG(fileName = 'chart', options = {}) {
        this.toPNG((dataUri) => {
            common_1.DataUri.downloadDataUri(dataUri, fileName);
        }, options);
    }
    exportJPEG(fileName = 'chart', options = {}) {
        this.toJPEG((dataUri) => {
            common_1.DataUri.downloadDataUri(dataUri, fileName);
        }, options);
    }
    exportSVG(fileName = 'chart', options = {}) {
        this.toSVG((svg) => {
            common_1.DataUri.downloadDataUri(common_1.DataUri.svgToDataUrl(svg), fileName);
        }, options);
    }
    toSVG(callback, options = {}) {
        this.notify('before:export', options);
        // Keep pace with the doc: default values should apply only when
        // the option keys are not present on the target object.
        // If a key exists (even with `undefined`), we respect that and do not override.
        if (!Object.hasOwn(options, 'copyStyles')) {
            options.copyStyles = true;
        }
        if (!Object.hasOwn(options, 'serializeImages')) {
            options.serializeImages = true;
        }
        const rawSVG = this.view.svg;
        const vSVG = common_1.Vector.create(rawSVG).clone();
        let clonedSVG = vSVG.node;
        const vStage = vSVG.findOne(`.${this.view.prefixClassName('graph-svg-stage')}`);
        const viewBox = options.viewBox || this.graph.graphToLocal(this.graph.getContentBBox());
        const dimension = options.preserveDimensions;
        if (dimension) {
            const size = typeof dimension === 'boolean' ? viewBox : dimension;
            vSVG.attr({
                width: size.width,
                height: size.height,
            });
        }
        vSVG
            .removeAttribute('style')
            .attr('viewBox', [viewBox.x, viewBox.y, viewBox.width, viewBox.height].join(' '));
        vStage.removeAttribute('transform');
        // Copies style declarations from external stylesheets into inline `style` attributes by computing style differences.
        // Implementation steps:
        // 1) Compute default UA styles in an isolated document.
        // 2) Compute styles in the current document for each original SVG node.
        // 3) Build the diff (properties that differ from defaults).
        // 4) Apply the diff to cloned SVG nodes via inline `style`.
        if (options.copyStyles) {
            const document = rawSVG.ownerDocument;
            const raws = Array.from(rawSVG.querySelectorAll('*'));
            const clones = Array.from(clonedSVG.querySelectorAll('*'));
            const isolatedDoc = document.implementation.createHTMLDocument('x6-export-defaults');
            const isolatedSVG = isolatedDoc.importNode(rawSVG, true);
            isolatedDoc.body.appendChild(isolatedSVG);
            const isolatedRaws = Array.from(isolatedSVG.querySelectorAll('*'));
            const defaultComputedStyles = {};
            isolatedRaws.forEach((elem, index) => {
                const computedStyle = window.getComputedStyle(elem, null);
                const defaultComputedStyle = {};
                // Use the style declaration list for reliable property names.
                for (let i = 0; i < computedStyle.length; i += 1) {
                    const prop = computedStyle[i];
                    const val = computedStyle.getPropertyValue(prop);
                    defaultComputedStyle[prop] = val;
                }
                defaultComputedStyles[index] = defaultComputedStyle;
            });
            const customStyles = {};
            raws.forEach((elem, index) => {
                const computedStyle = window.getComputedStyle(elem, null);
                const defaultComputedStyle = defaultComputedStyles[index] || {};
                const customStyle = {};
                for (let i = 0; i < computedStyle.length; i += 1) {
                    const prop = computedStyle[i];
                    const val = computedStyle.getPropertyValue(prop);
                    if (val !== defaultComputedStyle[prop]) {
                        customStyle[prop] = val;
                    }
                }
                customStyles[index] = customStyle;
            });
            clones.forEach((elem, index) => {
                common_1.Dom.css(elem, customStyles[index]);
            });
        }
        const stylesheet = options.stylesheet;
        if (typeof stylesheet === 'string') {
            const cDATASection = rawSVG
                .ownerDocument.implementation.createDocument(null, 'xml', null)
                .createCDATASection(stylesheet);
            vSVG.prepend(common_1.Vector.create('style', {
                type: 'text/css',
            }, [cDATASection]));
        }
        const format = () => {
            const beforeSerialize = options.beforeSerialize;
            if (typeof beforeSerialize === 'function') {
                const ret = common_1.FunctionExt.call(beforeSerialize, this.graph, clonedSVG);
                if (ret instanceof SVGSVGElement) {
                    clonedSVG = ret;
                }
            }
            const dataUri = new XMLSerializer()
                .serializeToString(clonedSVG)
                .replace(/&nbsp;/g, '\u00a0');
            this.notify('after:export', options);
            callback(dataUri);
        };
        if (options.serializeImages) {
            const deferrals = vSVG.find('image').map((vImage) => {
                return new Promise((resolve) => {
                    const url = vImage.attr('xlink:href') || vImage.attr('href');
                    common_1.DataUri.imageToDataUri(url, (err, dataUri) => {
                        if (!err && dataUri) {
                            vImage.attr('xlink:href', dataUri);
                            vImage.attr('href', dataUri);
                        }
                        resolve();
                    });
                });
            });
            Promise.all(deferrals).then(format);
        }
        else {
            format();
        }
    }
    toDataURL(callback, options) {
        let viewBox = options.viewBox || this.graph.getContentBBox();
        const padding = common_1.NumberExt.normalizeSides(options.padding);
        if (options.width && options.height) {
            if (padding.left + padding.right >= options.width) {
                padding.left = padding.right = 0;
            }
            if (padding.top + padding.bottom >= options.height) {
                padding.top = padding.bottom = 0;
            }
        }
        const expanding = new geometry_1.Rectangle(-padding.left, -padding.top, padding.left + padding.right, padding.top + padding.bottom);
        if (options.width && options.height) {
            const width = viewBox.width + padding.left + padding.right;
            const height = viewBox.height + padding.top + padding.bottom;
            expanding.scale(width / options.width, height / options.height);
        }
        viewBox = geometry_1.Rectangle.create(viewBox).moveAndExpand(expanding);
        const rawSize = typeof options.width === 'number' && typeof options.height === 'number'
            ? { width: options.width, height: options.height }
            : viewBox;
        let scale = options.ratio ? options.ratio : 1;
        if (!Number.isFinite(scale) || scale === 0) {
            scale = 1;
        }
        const size = {
            width: Math.max(Math.round(rawSize.width * scale), 1),
            height: Math.max(Math.round(rawSize.height * scale), 1),
        };
        {
            const imgDataCanvas = document.createElement('canvas');
            const context2D = imgDataCanvas.getContext('2d');
            imgDataCanvas.width = size.width;
            imgDataCanvas.height = size.height;
            const x = size.width - 1;
            const y = size.height - 1;
            context2D.fillStyle = 'rgb(1,1,1)';
            context2D.fillRect(x, y, 1, 1);
            const data = context2D.getImageData(x, y, 1, 1).data;
            if (data[0] !== 1 || data[1] !== 1 || data[2] !== 1) {
                throw new Error('size exceeded');
            }
        }
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size.width;
            canvas.height = size.height;
            const context = canvas.getContext('2d');
            context.fillStyle = options.backgroundColor || 'white';
            context.fillRect(0, 0, size.width, size.height);
            try {
                context.drawImage(img, 0, 0, size.width, size.height);
                const dataUri = canvas.toDataURL(options.type, options.quality);
                callback(dataUri);
            }
            catch (error) {
                // pass
            }
        };
        this.toSVG((dataUri) => {
            img.src = `data:image/svg+xml,${encodeURIComponent(dataUri)}`;
        }, Object.assign(Object.assign({}, options), { viewBox, serializeImages: true, preserveDimensions: Object.assign({}, size) }));
    }
    toPNG(callback, options = {}) {
        this.toDataURL(callback, Object.assign(Object.assign({}, options), { type: 'image/png' }));
    }
    toJPEG(callback, options = {}) {
        this.toDataURL(callback, Object.assign(Object.assign({}, options), { type: 'image/jpeg' }));
    }
    notify(name, args) {
        this.trigger(name, args);
        this.graph.trigger(name, args);
    }
    dispose() {
        this.off();
    }
}
exports.Export = Export;
tslib_1.__decorate([
    (0, common_1.disposable)()
], Export.prototype, "dispose", null);
//# sourceMappingURL=index.js.map