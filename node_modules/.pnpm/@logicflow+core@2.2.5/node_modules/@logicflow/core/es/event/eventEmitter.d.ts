import { EventArgs } from './eventArgs';
export type EventType<T extends string = string> = {
    readonly callback: EventCallback<T>;
    readonly once: boolean;
};
export type EventsType<T extends string = string> = {
    [k in T]?: EventType<k>[];
};
export type CallbackArgs<T extends string = string> = T extends keyof EventArgs ? EventArgs[T] : any;
export type EventCallback<T extends string = string> = (args: CallbackArgs<T>) => void;
export default class EventEmitter {
    private _events;
    /**
     * 监听一个事件
     * @param evt 事件名称
     * @param callback 回调函数
     * @param once 是否只监听一次
     */
    on<T extends keyof EventArgs>(evt: T, callback: EventCallback<T>, once?: boolean): void;
    on<T extends string>(evt: T, callback: EventCallback<T>, once?: boolean): void;
    /**
     * 监听一个事件一次
     * @param evt 事件名称
     * @param callback 回调函数
     */
    once<T extends keyof EventArgs>(evt: T, callback: (args: EventArgs[T]) => void): void;
    once<T extends string>(evt: T, callback: EventCallback<T>): void;
    /**
     * 触发一个事件
     * @param evts
     * @param eventArgs
     */
    emit<T extends keyof EventArgs>(evts: T, eventArgs: CallbackArgs<T>): void;
    emit<T extends string>(evts: T, eventArgs: CallbackArgs<T>): void;
    /**
     * 取消事件监听
     * @param evts 事件名称
     * @param callback 回调函数
     *
     * - evts 为空时，清除所有事件的监听器
     * - evts 非空，callback 为空时，清除指定事件的所有监听器
     * - evts 非空，callback 非空，进行对象比较，清除指定事件的指定监听器
     */
    off<T extends keyof EventArgs>(evts: T, callback?: (args: EventArgs[T]) => void): void;
    off<T extends string>(evts: T, callback?: EventCallback<T>): void;
    getEvents(): EventsType<string>;
    destroy(): void;
}
export { EventEmitter, EventArgs };
