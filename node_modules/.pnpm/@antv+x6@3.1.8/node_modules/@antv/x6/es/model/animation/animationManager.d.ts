import type { Animation } from './animation';
export declare class AnimationManager {
    animations: Animation[];
    addAnimation(animation: Animation): void;
    getAnimations(): Animation[];
    cancelAnimations(): void;
}
