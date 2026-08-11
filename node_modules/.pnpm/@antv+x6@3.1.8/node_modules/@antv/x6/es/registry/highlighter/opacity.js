import { Dom } from '../../common';
import { Config } from '../../config';
const className = Config.prefix('highlight-opacity');
export const opacity = {
    highlight(cellView, magnet) {
        Dom.addClass(magnet, className);
    },
    unhighlight(cellView, magnetEl) {
        Dom.removeClass(magnetEl, className);
    },
};
//# sourceMappingURL=opacity.js.map