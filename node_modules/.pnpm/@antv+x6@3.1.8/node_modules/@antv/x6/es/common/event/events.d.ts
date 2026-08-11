import { type AsyncBoolean } from '../function';
import type { EventArgs, EventNames, Handler, NamesWithArrayArgs, OptionalNormalNames, OtherNames, RequiredNormalNames, UnknownNames } from './types';
export declare class Events<Args extends EventArgs = any> {
    private listeners;
    on<Name extends EventNames<Args>>(name: Name, handler: Handler<Args[Name]>, context?: any): this;
    on<Name extends UnknownNames<Args>>(name: Name, handler: Handler<any>, context?: any): this;
    once<Name extends EventNames<Args>>(name: Name, handler: Handler<Args[Name]>, context?: any): this;
    once<Name extends UnknownNames<Args>>(name: Name, handler: Handler<any>, context?: any): this;
    off(): this;
    off(name: null, handler: Handler<any>): this;
    off(name: null, handler: null, context: any): this;
    off<Name extends EventNames<Args>>(name: Name, handler?: Handler<Args[Name]>, context?: any): this;
    off<Name extends UnknownNames<Args>>(name: Name, handler?: Handler<any>, context?: any): this;
    trigger<Name extends OptionalNormalNames<Args>>(name: Name): AsyncBoolean;
    trigger<Name extends RequiredNormalNames<Args>>(name: Name, args: Args[Name]): AsyncBoolean;
    trigger<Name extends NamesWithArrayArgs<Args>>(name: Name, ...args: Args[Name]): AsyncBoolean;
    trigger<Name extends OtherNames<Args>>(name: Name, args?: Args[Name]): AsyncBoolean;
    trigger<Name extends OtherNames<Args>>(name: Name, ...args: Args[Name]): AsyncBoolean;
    trigger<Name extends UnknownNames<Args>>(name: Name, ...args: any[]): AsyncBoolean;
    /**
     * Triggers event with specified event name. Unknown names
     * will cause a typescript type error.
     */
    protected emit<Name extends OptionalNormalNames<Args>>(name: Name): AsyncBoolean;
    protected emit<Name extends RequiredNormalNames<Args>>(name: Name, args: Args[Name]): AsyncBoolean;
    protected emit<Name extends NamesWithArrayArgs<Args>>(name: Name, ...args: Args[Name]): AsyncBoolean;
    protected emit<Name extends OtherNames<Args>>(name: Name, args?: Args[Name]): AsyncBoolean;
    protected emit<Name extends OtherNames<Args>>(name: Name, ...args: Args[Name]): AsyncBoolean;
}
