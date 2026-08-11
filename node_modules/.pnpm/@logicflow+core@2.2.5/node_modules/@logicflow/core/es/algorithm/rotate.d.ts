export interface SimplePoint {
    x: number;
    y: number;
}
/**
 * 根据两个点获取中心点坐标
 */
export declare function getNewCenter(startPoint: SimplePoint, endPoint: SimplePoint): {
    x: number;
    y: number;
};
/**
 * 旋转矩阵公式，可以获取某一个坐标旋转angle后的坐标
 * @param p 当前坐标
 * @param center 旋转中心
 * @param angle 旋转角度（不是弧度）
 */
export declare function calculatePointAfterRotateAngle(p: SimplePoint, center: SimplePoint, angle: number): {
    x: number;
    y: number;
};
/**
 * 角度转弧度
 * @param angle 角度
 */
export declare function angleToRadian(angle: number): number;
/**
 * 弧度转角度
 * @param radian 弧度
 */
export declare function radianToAngle(radian: number): number;
