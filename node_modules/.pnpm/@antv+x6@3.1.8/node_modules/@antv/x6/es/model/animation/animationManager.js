export class AnimationManager {
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
//# sourceMappingURL=animationManager.js.map