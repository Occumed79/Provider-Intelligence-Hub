import { FunctionExt } from '../../../common';
import { defaults } from './options';
import { router } from './router';
export const manhattan = function (vertices, options, edgeView) {
    return FunctionExt.call(router, this, vertices, Object.assign(Object.assign({}, defaults), options), edgeView);
};
//# sourceMappingURL=index.js.map