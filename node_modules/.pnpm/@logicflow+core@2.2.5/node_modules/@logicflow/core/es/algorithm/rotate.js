/**
 * 根据两个点获取中心点坐标
 */
export function getNewCenter(startPoint, endPoint) {
    var x1 = startPoint.x, y1 = startPoint.y;
    var x2 = endPoint.x, y2 = endPoint.y;
    var newCenter = {
        x: x1 + (x2 - x1) / 2,
        y: y1 + (y2 - y1) / 2,
    };
    return newCenter;
}
/**
 * 旋转矩阵公式，可以获取某一个坐标旋转angle后的坐标
 * @param p 当前坐标
 * @param center 旋转中心
 * @param angle 旋转角度（不是弧度）
 */
export function calculatePointAfterRotateAngle(p, center, angle) {
    var radian = angleToRadian(angle);
    var dx = p.x - center.x;
    var dy = p.y - center.y;
    var x = dx * Math.cos(radian) - dy * Math.sin(radian) + center.x;
    var y = dx * Math.sin(radian) + dy * Math.cos(radian) + center.y;
    return {
        x: x,
        y: y,
    };
}
/**
 * 角度转弧度
 * @param angle 角度
 */
export function angleToRadian(angle) {
    return (angle * Math.PI) / 180;
}
/**
 * 弧度转角度
 * @param radian 弧度
 */
export function radianToAngle(radian) {
    return (radian / Math.PI) * 180;
}
