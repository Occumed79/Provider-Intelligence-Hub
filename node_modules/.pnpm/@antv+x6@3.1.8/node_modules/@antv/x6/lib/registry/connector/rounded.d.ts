import type { ConnectorBaseOptions, ConnectorDefinition } from './index';
export interface RoundedConnectorOptions extends ConnectorBaseOptions {
    radius?: number;
}
export declare const rounded: ConnectorDefinition<RoundedConnectorOptions>;
