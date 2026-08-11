import { Path, Polyline } from '../../geometry';
export const normal = (sourcePoint, targetPoint, routePoints, options = {}) => {
    const points = [sourcePoint, ...routePoints, targetPoint];
    const polyline = new Polyline(points);
    const path = new Path(polyline);
    return options.raw ? path : path.serialize();
};
//# sourceMappingURL=normal.js.map