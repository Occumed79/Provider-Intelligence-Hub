"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationManager = void 0;
class AnimationManager {
    constructor() {
        this.animations = [];
    }
    addAnimation(animation) {
        this.animations.push(animation);
    }
    getAnimations() {
        return this.animations;
    }
    cancelAnimations() {
        this.animations.forEach((animation) => {
            animation.cancel();
        });
    }
}
exports.AnimationManager = AnimationManager;
//# sourceMappingURL=animationManager.js.map