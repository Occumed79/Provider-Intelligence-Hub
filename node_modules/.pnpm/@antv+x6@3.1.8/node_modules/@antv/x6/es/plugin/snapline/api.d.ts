import type { SnaplineFilter } from './type';
declare module '../../graph/graph' {
    interface Graph {
        isSnaplineEnabled: () => boolean;
        enableSnapline: () => Graph;
        disableSnapline: () => Graph;
        toggleSnapline: (enabled?: boolean) => Graph;
        hideSnapline: () => Graph;
        setSnaplineFilter: (filter?: SnaplineFilter) => Graph;
        isSnaplineOnResizingEnabled: () => boolean;
        enableSnaplineOnResizing: () => Graph;
        disableSnaplineOnResizing: () => Graph;
        toggleSnaplineOnResizing: (enableOnResizing?: boolean) => Graph;
        isSharpSnapline: () => boolean;
        enableSharpSnapline: () => Graph;
        disableSharpSnapline: () => Graph;
        toggleSharpSnapline: (sharp?: boolean) => Graph;
        getSnaplineTolerance: () => number | undefined;
        setSnaplineTolerance: (tolerance: number) => Graph;
    }
}
