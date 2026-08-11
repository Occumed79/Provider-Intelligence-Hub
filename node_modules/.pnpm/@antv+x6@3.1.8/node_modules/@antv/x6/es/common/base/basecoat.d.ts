import { Events } from '../event';
import type { EventArgs } from '../event/types';
import { Disposable } from './disposable';
export declare class Basecoat<A extends EventArgs = any> extends Events<A> implements Disposable {
    dispose(): void;
}
export interface Basecoat extends Disposable {
}
