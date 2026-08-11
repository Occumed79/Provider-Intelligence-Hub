import type { ConnectorBaseOptions, ConnectorDefinition } from './index';
export interface NormalConnectorOptions extends ConnectorBaseOptions {
    split?: boolean | number;
}
export declare const normal: ConnectorDefinition;
