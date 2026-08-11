import type { ConnectorBaseOptions, ConnectorDefinition } from './index';
export interface LoopConnectorOptions extends ConnectorBaseOptions {
    split?: boolean | number;
}
export declare const loop: ConnectorDefinition<LoopConnectorOptions>;
