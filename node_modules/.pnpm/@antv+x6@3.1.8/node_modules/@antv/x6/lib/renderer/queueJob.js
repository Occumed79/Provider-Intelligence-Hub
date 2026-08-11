"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_PRIORITY = exports.JobQueue = void 0;
const SCHEDULE_MODE = {
    idle: 'idle',
    raf: 'raf',
    timeout: 'timeout',
};
class JobQueue {
    constructor() {
        this.isFlushing = false;
        this.isFlushPending = false;
        this.scheduleId = 0;
        this.queue = [];
        this.frameInterval = 16;
        this.initialTime = Date.now();
        this.pendingJobs = new Map();
        this.scheduleMode = null;
    }
    queueJob(job) {
        if (job.priority & JOB_PRIORITY.PRIOR) {
            job.cb();
        }
        else {
            const existing = this.pendingJobs.get(job.id);
            if (existing) {
                // 仅更新已有任务的回调与优先级
                existing.cb = job.cb;
                if (job.priority !== existing.priority) {
                    existing.priority = job.priority;
                    const idx = this.queue.indexOf(existing);
                    if (idx >= 0) {
                        this.queue.splice(idx, 1);
                        const newIndex = this.findInsertionIndex(existing);
                        this.queue.splice(newIndex, 0, existing);
                    }
                }
            }
            else {
                const index = this.findInsertionIndex(job);
                this.queue.splice(index, 0, job);
                this.pendingJobs.set(job.id, job);
            }
        }
    }
    queueFlush() {
        if (!this.isFlushing && !this.isFlushPending) {
            this.isFlushPending = true;
            this.scheduleJob();
        }
    }
    queueFlushSync() {
        if (!this.isFlushing && !this.isFlushPending) {
            this.isFlushPending = true;
            this.flushJobsSync();
        }
    }
    clearJobs() {
        this.queue.length = 0;
        this.pendingJobs.clear();
        this.isFlushing = false;
        this.isFlushPending = false;
        this.cancelScheduleJob();
    }
    flushJobs(deadline) {
        this.isFlushPending = false;
        this.isFlushing = true;
        const startTime = this.getCurrentTime();
        let budget = this.frameInterval;
        if (deadline && typeof deadline.timeRemaining === 'function') {
            const remain = deadline.timeRemaining();
            // 防止过长占用单帧
            budget = Math.max(0, Math.min(budget, remain));
        }
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            job.cb();
            this.pendingJobs.delete(job.id);
            if (this.getCurrentTime() - startTime >= budget) {
                break;
            }
        }
        this.isFlushing = false;
        if (this.queue.length) {
            this.queueFlush();
        }
    }
    flushJobsSync() {
        this.isFlushPending = false;
        this.isFlushing = true;
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            try {
                job.cb();
            }
            catch (error) {
                console.error(error);
            }
            this.pendingJobs.delete(job.id);
        }
        this.isFlushing = false;
    }
    findInsertionIndex(job) {
        let left = 0;
        let ins = this.queue.length;
        let right = ins - 1;
        const priority = job.priority;
        while (left <= right) {
            const mid = ((right - left) >> 1) + left;
            if (priority <= this.queue[mid].priority) {
                left = mid + 1;
            }
            else {
                ins = mid;
                right = mid - 1;
            }
        }
        return ins;
    }
    scheduleJob() {
        if (this.scheduleId) {
            this.cancelScheduleJob();
        }
        if ('requestAnimationFrame' in window) {
            this.scheduleMode = SCHEDULE_MODE.raf;
            this.scheduleId = window.requestAnimationFrame(() => this.flushJobs());
        }
        else if ('requestIdleCallback' in window) {
            this.scheduleMode = SCHEDULE_MODE.idle;
            this.scheduleId = window.requestIdleCallback((deadline) => this.flushJobs(deadline), {
                timeout: 100,
            });
        }
        else {
            this.scheduleMode = SCHEDULE_MODE.timeout;
            this.scheduleId = window.setTimeout(() => this.flushJobs());
        }
    }
    cancelScheduleJob() {
        if (!this.scheduleId)
            return;
        const cancelMethods = {
            [SCHEDULE_MODE.idle]: window === null || window === void 0 ? void 0 : window.cancelIdleCallback,
            [SCHEDULE_MODE.raf]: window === null || window === void 0 ? void 0 : window.cancelAnimationFrame,
            [SCHEDULE_MODE.timeout]: window === null || window === void 0 ? void 0 : window.clearTimeout,
        };
        const mode = this.scheduleMode;
        const cancelMethod = mode ? cancelMethods[mode] : undefined;
        if (typeof cancelMethod === 'function') {
            cancelMethod(this.scheduleId);
        }
        this.scheduleId = 0;
        this.scheduleMode = null;
    }
    getCurrentTime() {
        const hasPerformanceNow = typeof performance === 'object' && typeof performance.now === 'function';
        if (hasPerformanceNow) {
            return performance.now();
        }
        return Date.now() - this.initialTime;
    }
}
exports.JobQueue = JobQueue;
var JOB_PRIORITY;
(function (JOB_PRIORITY) {
    JOB_PRIORITY[JOB_PRIORITY["Update"] = 2] = "Update";
    JOB_PRIORITY[JOB_PRIORITY["RenderEdge"] = 4] = "RenderEdge";
    JOB_PRIORITY[JOB_PRIORITY["RenderNode"] = 8] = "RenderNode";
    JOB_PRIORITY[JOB_PRIORITY["PRIOR"] = 1048576] = "PRIOR";
})(JOB_PRIORITY || (exports.JOB_PRIORITY = JOB_PRIORITY = {}));
//# sourceMappingURL=queueJob.js.map