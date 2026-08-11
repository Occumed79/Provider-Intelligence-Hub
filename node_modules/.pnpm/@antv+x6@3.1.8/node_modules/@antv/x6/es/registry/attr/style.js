import { Dom, ObjectExt } from '../../common';
export const style = {
    qualify: ObjectExt.isPlainObject,
    set(styles, { elem }) {
        Dom.css(elem, styles);
    },
};
//# sourceMappingURL=style.js.map