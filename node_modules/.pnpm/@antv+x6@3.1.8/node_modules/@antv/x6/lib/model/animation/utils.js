"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotReservedWord = isNotReservedWord;
exports.isReverseDirection = isReverseDirection;
function isNotReservedWord(member) {
    return (member !== 'offset' &&
        member !== 'easing' &&
        member !== 'composite' &&
        member !== 'computedOffset');
}
function isReverseDirection(direction, currentIteration) {
    return (direction === 'reverse' ||
        (direction === 'alternate' && currentIteration % 2 === 1) ||
        (direction === 'alternate-reverse' && currentIteration % 2 === 0));
}
//# sourceMappingURL=utils.js.map