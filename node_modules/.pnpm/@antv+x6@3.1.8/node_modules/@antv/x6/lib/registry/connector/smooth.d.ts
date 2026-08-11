import type { ConnectorBaseOptions, ConnectorDefinition } from './index';
export interface SmoothConnectorOptions extends ConnectorBaseOptions {
    direction?: 'H' | 'V';
}
export declare const smooth: ConnectorDefinition<SmoothConnectorOptions>;
