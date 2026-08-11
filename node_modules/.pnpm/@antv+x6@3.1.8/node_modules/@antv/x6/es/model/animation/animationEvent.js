/**
 * Web Animation API 的 AnimationPlaybackEvent 实现
 * 参考: https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect
 */
export class AnimationPlaybackEvent {
    constructor(target, type, currentTime, timelineTime) {
        var _a;
        this.target = target;
        this.cell = (_a = this.target.effect) === null || _a === void 0 ? void 0 : _a.target;
        this.type = type;
        this.bubbles = false;
        this.currentTarget = target;
        this.defaultPrevented = false;
        this.eventPhase = 0;
        this.timeStamp = performance.now();
        this.currentTime = currentTime;
        this.timelineTime = timelineTime;
    }
}
//# sourceMappingURL=animationEvent.js.map