import { get } from 'lodash-es';
export var isIe = function () {
    return get(window, 'navigator.userAgent', '').match(/MSIE|Trident/) !== null;
};
