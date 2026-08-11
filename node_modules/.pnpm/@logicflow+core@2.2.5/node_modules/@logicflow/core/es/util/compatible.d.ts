/**
 * 对数据实现兼容处理。
 *
 * Vue 中的 data 会进行 Observe，深拷贝的原始数据对象
 */
export declare function formatData<T>(data: T): T;
