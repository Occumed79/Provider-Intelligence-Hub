import type { HistoryCommand, HistoryCommonOptions, HistoryModelEvents, HistoryOptions } from './type';
export declare function isAddEvent(event?: HistoryModelEvents): event is "cell:added";
export declare function isRemoveEvent(event?: HistoryModelEvents): event is "cell:removed";
export declare function isChangeEvent(event?: HistoryModelEvents): boolean;
export declare function getOptions(options: HistoryOptions): HistoryCommonOptions;
export declare function sortBatchCommands(cmds: HistoryCommand[]): HistoryCommand[];
