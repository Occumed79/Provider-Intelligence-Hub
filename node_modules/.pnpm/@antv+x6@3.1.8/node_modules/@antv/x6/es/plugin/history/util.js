export function isAddEvent(event) {
    return event === 'cell:added';
}
export function isRemoveEvent(event) {
    return event === 'cell:removed';
}
export function isChangeEvent(event) {
    return event != null && event.startsWith('cell:change:');
}
export function getOptions(options) {
    const reservedNames = [
        'cell:added',
        'cell:removed',
        'cell:change:*',
    ];
    const batchEvents = ['batch:start', 'batch:stop'];
    const eventNames = options.eventNames
        ? options.eventNames.filter((event) => !(isChangeEvent(event) ||
            reservedNames.includes(event) ||
            batchEvents.includes(event)))
        : reservedNames;
    return Object.assign(Object.assign({ enabled: true }, options), { eventNames, applyOptionsList: options.applyOptionsList || ['propertyPath'], revertOptionsList: options.revertOptionsList || ['propertyPath'] });
}
export function sortBatchCommands(cmds) {
    const results = [];
    for (let i = 0, ii = cmds.length; i < ii; i += 1) {
        const cmd = cmds[i];
        let index = null;
        if (isAddEvent(cmd.event)) {
            const id = cmd.data.id;
            for (let j = 0; j < i; j += 1) {
                if (cmds[j].data.id === id) {
                    index = j;
                    break;
                }
            }
        }
        if (index !== null) {
            results.splice(index, 0, cmd);
        }
        else {
            results.push(cmd);
        }
    }
    return results;
}
//# sourceMappingURL=util.js.map