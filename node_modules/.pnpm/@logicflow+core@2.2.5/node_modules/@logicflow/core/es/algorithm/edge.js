/**
 * 求两个线段交点入参：线段1端点: ab, 线段2端点： cd,
 * @param a
 * @param b
 * @param c
 * @param d
 * @return：有交点返回交点 Point，无交点返回false
 */
export var getCrossPointOfLine = function (a, b, c, d) {
    /** 1 解线性方程组, 求线段交点. * */
    // 如果分母为0 则平行或共线, 不相交
    var denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
    if (denominator === 0) {
        return false;
    }
    // 线段所在直线的交点坐标 (x , y)
    var x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y) +
        (b.y - a.y) * (d.x - c.x) * a.x -
        (d.y - c.y) * (b.x - a.x) * c.x) /
        denominator;
    var y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x) +
        (b.x - a.x) * (d.y - c.y) * a.y -
        (d.x - c.x) * (b.y - a.y) * c.y) / denominator;
    /** 2 判断交点是否在两条线段上 * */
    if (
    // 交点在线段1上
    (x - a.x) * (x - b.x) <= 0 &&
        (y - a.y) * (y - b.y) <= 0 &&
        // 且交点也在线段2上
        (x - c.x) * (x - d.x) <= 0 &&
        (y - c.y) * (y - d.y) <= 0) {
        // 返回交点p
        return {
            x: x,
            y: y,
        };
    }
    // 否则不相交
    return false;
};
/* 判断一个点是否在线段中
入参点：point, 线段起终点，start,end,
返回值： 在线段中true，否则false
*/
export var isInSegment = function (point, start, end) {
    var x = point.x, y = point.y;
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
    var k = (endY - startY) / (endX - startX);
    var b = startY - k * startX;
    return (((x >= startX && x <= endX) || (x <= startX && x >= endX)) &&
        ((y >= startY && y <= endY) || (y <= startY && y >= endY)) &&
        Math.abs(y - k * x - b) < Number.EPSILON);
};
