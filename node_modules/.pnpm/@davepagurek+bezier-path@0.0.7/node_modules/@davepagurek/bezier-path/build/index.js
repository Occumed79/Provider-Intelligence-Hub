function times(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(i);
    }
    return arr;
}

class BezierSegment {
    constructor(A, B, C, D) {
        this._totalLength = undefined;
        this.A = A;
        this.B = B;
        this.C = C;
        this.D = D;
    }
    static sampleSpacing() {
        return 2;
    }
    tangentAtParameter(parameter) {
        const t = Math.max(0, Math.min(1, parameter)); // clamp to [0, 1]
        if (t === 0 || t === 1) {
            let x;
            let y;
            if (t === 0) {
                if (this.A.x === this.B.x && this.A.y === this.B.y) {
                    x = this.C.x - this.A.x;
                    y = this.C.y - this.A.y;
                }
                else {
                    x = this.B.x - this.A.x;
                    y = this.B.y - this.A.y;
                }
            }
            else {
                if (this.D.x === this.C.x && this.D.y === this.C.y) {
                    x = this.D.x - this.B.x;
                    y = this.D.y - this.B.y;
                }
                else {
                    x = this.D.x - this.C.x;
                    y = this.D.y - this.C.y;
                }
            }
            const hypot = Math.hypot(x, y);
            if (Math.abs(hypot) > 1e-4) {
                x /= hypot;
                y /= hypot;
            }
            return { x, y };
        }
        const adjustedT = 1 - t;
        let x = 3 * this.D.x * Math.pow(t, 2) -
            3 * this.C.x * Math.pow(t, 2) +
            6 * this.C.x * adjustedT * t -
            6 * this.B.x * adjustedT * t +
            3 * this.B.x * Math.pow(adjustedT, 2) -
            3 * this.A.x * Math.pow(adjustedT, 2);
        let y = 3 * this.D.y * Math.pow(t, 2) -
            3 * this.C.y * Math.pow(t, 2) +
            6 * this.C.y * adjustedT * t -
            6 * this.B.y * adjustedT * t +
            3 * this.B.y * Math.pow(adjustedT, 2) -
            3 * this.A.y * Math.pow(adjustedT, 2);
        const hypot = Math.hypot(x, y);
        if (Math.abs(hypot) > 1e-4) {
            x /= hypot;
            y /= hypot;
        }
        return { x, y };
    }
    isLinear() {
        return (this.A.x === this.B.x &&
            this.A.y === this.B.y &&
            this.C.x === this.D.x &&
            this.C.y === this.D.y);
    }
    pointAtParameter(parameter) {
        const t = Math.max(0, Math.min(1, parameter)); // clamp to [0, 1]
        return {
            x: Math.pow(1 - t, 3) * this.A.x +
                3 * Math.pow(1 - t, 2) * t * this.B.x +
                3 * (1 - t) * Math.pow(t, 2) * this.C.x +
                Math.pow(t, 3) * this.D.x,
            y: Math.pow(1 - t, 3) * this.A.y +
                3 * Math.pow(1 - t, 2) * t * this.B.y +
                3 * (1 - t) * Math.pow(t, 2) * this.C.y +
                Math.pow(t, 3) * this.D.y,
        };
    }
    getTotalLength() {
        if (this._totalLength === undefined) {
            if (this.isLinear()) {
                this._totalLength = Math.hypot(this.D.x - this.A.x, this.D.y - this.A.y);
            }
            else {
                const initialSamples = Math.max(10, Math.ceil((Math.hypot(this.B.x - this.A.x, this.B.y - this.A.y) +
                    Math.hypot(this.C.x - this.B.x, this.C.y - this.B.y) +
                    Math.hypot(this.D.x - this.C.x, this.D.y - this.C.y)) /
                    BezierSegment.sampleSpacing()));
                const pts = times(initialSamples).map((i) => this.pointAtParameter(i / (initialSamples - 1)));
                let total = 0;
                for (let i = 1; i < pts.length; i++) {
                    total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
                }
                this._totalLength = total;
            }
        }
        return this._totalLength;
    }
}

class BezierPath {
    constructor(segments) {
        this.samples = [];
        this.segments = segments;
        const segmentLengths = segments.map((s) => s.getTotalLength());
        const segmentOffsets = [0];
        for (let i = 1; i < segmentLengths.length; i++) {
            segmentOffsets.push(segmentOffsets[i - 1] + segmentLengths[i - 1]);
        }
        this._totalLength =
            segmentOffsets[segmentOffsets.length - 1] +
                segmentLengths[segmentLengths.length - 1];
        const numSegSamples = (seg) => Math.max(4, Math.ceil(seg.getTotalLength() / BezierSegment.sampleSpacing()));
        const segmentSamples = segments.map(numSegSamples);
        const numSamples = segmentSamples.reduce((acc, next) => acc + next);
        const stepSize = 1 / numSamples / 10;
        const avgDist = this._totalLength / numSamples;
        this.samples.push({
            dist: 0,
            pt: this.segments[0].A,
            tan: this.segments[0].tangentAtParameter(0),
            segIdx: 0,
            t: 0,
        });
        segments.forEach((seg, segIdx) => {
            const numSegSamples = segmentSamples[segIdx];
            // Include one extra point at the end at t = 1
            const ts = times(numSegSamples + 1).map((i) => i / numSegSamples);
            const pts = ts.map((t) => seg.pointAtParameter(t));
            let dists;
            for (let it = 0; it < 4; it++) {
                dists = times(numSegSamples).map((i) => Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y));
                const distErrors = dists.map((d) => d - avgDist);
                let offset = 0;
                for (let i = 1; i < ts.length - 1; i++) {
                    // Shift this t value to get closer to the target length
                    offset += distErrors[i - 1];
                    ts[i] -= stepSize * offset;
                    // Sample the point at the new t value
                    pts[i] = seg.pointAtParameter(ts[i]);
                }
            }
            let lastOffset = 0;
            pts.slice(1).forEach((pt, i) => {
                lastOffset += dists[i];
                this.samples.push({
                    dist: segmentOffsets[segIdx] + lastOffset,
                    pt,
                    tan: this.segments[segIdx].tangentAtParameter(ts[i + 1]),
                    segIdx,
                    t: ts[i + 1],
                });
            });
        });
        this._jumps = [];
        this.segmentStartEnds = [{ start: 0, end: 0 }];
        for (let i = 1; i < this.samples.length; i++) {
            let prev = this.samples[i - 1];
            let next = this.samples[i];
            if (next.segIdx === prev.segIdx) {
                this.segmentStartEnds[this.segmentStartEnds.length - 1].end = next.dist;
            }
            else {
                const segmentStartDist = next.dist - Math.hypot(this.segments[next.segIdx].A.x - next.pt.x, this.segments[next.segIdx].A.y - next.pt.y);
                if ((this.segments[prev.segIdx].D.x !== this.segments[next.segIdx].A.x ||
                    this.segments[prev.segIdx].D.y !== this.segments[next.segIdx].A.y)) {
                    const prevEnd = {
                        dist: segmentStartDist - 1e-8,
                        pt: this.segments[prev.segIdx].D,
                        tan: this.segments[prev.segIdx].tangentAtParameter(1),
                        segIdx: prev.segIdx,
                        t: 1,
                    };
                    const nextStart = {
                        dist: segmentStartDist + 1e-8,
                        pt: this.segments[next.segIdx].A,
                        tan: this.segments[next.segIdx].tangentAtParameter(0),
                        segIdx: next.segIdx,
                        t: 0,
                    };
                    this._jumps.push(segmentStartDist);
                    this.samples.splice(i, 0, prevEnd, nextStart);
                    this.segmentStartEnds[prevEnd.segIdx].end = prevEnd.dist;
                    this.segmentStartEnds[nextStart.segIdx] = {
                        start: nextStart.dist,
                        end: next.dist,
                    };
                    i += 2;
                }
                else if (next.t !== 0) {
                    const nextStart = Object.assign(Object.assign({}, next), { t: 0, pt: this.segments[next.segIdx].A, tan: this.segments[next.segIdx].tangentAtParameter(0), dist: segmentStartDist });
                    this.samples.splice(i, 0, nextStart);
                    this.segmentStartEnds[next.segIdx] = {
                        start: nextStart.dist,
                        end: next.dist,
                    };
                    i++;
                }
                else {
                    this.segmentStartEnds[next.segIdx] = {
                        start: next.dist,
                        end: next.dist,
                    };
                }
            }
        }
    }
    jumps() {
        return [...this._jumps];
    }
    getTotalLength() {
        return this._totalLength;
    }
    findClosestSampleIdx(dist) {
        // Binary search to find the sample with the closest dist
        let lo = 0;
        let hi = this.samples.length - 1;
        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (this.samples[mid].dist > dist) {
                hi = mid - 1;
            }
            else if (this.samples[mid].dist < dist) {
                lo = mid + 1;
            }
            else {
                return mid;
            }
        }
        return Math.max(0, Math.min(this.samples.length - 1, Math.floor((lo + hi) / 2)));
    }
    getPointAtLength(length, approximate = false) {
        if (length <= 0)
            return this.samples[0].pt;
        if (length >= this._totalLength)
            return this.samples[this.samples.length - 1].pt;
        const idxA = this.findClosestSampleIdx(length);
        const idxB = this.samples[idxA].dist < length
            ? Math.min(idxA + 1, this.samples.length - 1)
            : Math.max(0, idxA - 1);
        const mix = Math.abs(this.samples[idxB].dist - this.samples[idxA].dist) < 1e-6
            ? 0
            : (length - this.samples[idxA].dist) /
                (this.samples[idxB].dist - this.samples[idxA].dist);
        if (approximate || this.samples[idxA].segIdx > this.samples[idxB].segIdx) {
            // We have a set of evenly spaced samples that are close enough together
            // that we can probably just linearly interpolate between them without
            // too much loss of quality
            const x = (1 - mix) * this.samples[idxA].pt.x + mix * this.samples[idxB].pt.x;
            const y = (1 - mix) * this.samples[idxA].pt.y + mix * this.samples[idxB].pt.y;
            return { x, y };
        }
        else if (this.samples[idxA].segIdx !== this.samples[idxB].segIdx) {
            const tDiff = 1 - this.samples[idxA].t + this.samples[idxB].t;
            const mixMid = tDiff > 0 ? (1 - this.samples[idxA].t) / tDiff : 0.5;
            if (mix < mixMid) {
                const segment = this.segments[this.samples[idxA].segIdx];
                const mixA = mix / mixMid;
                const t = (1 - mixA) * this.samples[idxA].t + mixA;
                return segment.pointAtParameter(t);
            }
            else {
                const segment = this.segments[this.samples[idxB].segIdx];
                const mixB = (mix - mixMid) / (1 - mixMid);
                const t = mixB * this.samples[idxB].t;
                return segment.pointAtParameter(t);
            }
        }
        else {
            const segment = this.segments[this.samples[idxA].segIdx];
            const t = (1 - mix) * this.samples[idxA].t + mix * this.samples[idxB].t;
            return segment.pointAtParameter(t);
        }
    }
    getAngleAtLength(length, approximate = false) {
        const a = this.getTangentAtLength(length, approximate);
        const angle = Math.atan2(a.y, a.x);
        return angle;
    }
    getTangentAtLength(length, approximate = false) {
        if (length <= 0)
            return this.samples[0].tan;
        if (length >= this._totalLength)
            return this.samples[this.samples.length - 1].tan;
        const idxA = this.findClosestSampleIdx(length);
        const idxB = this.samples[idxA].dist < length
            ? Math.min(idxA + 1, this.samples.length - 1)
            : Math.max(0, idxA - 1);
        const mix = (length - this.samples[idxA].dist) /
            (this.samples[idxB].dist - this.samples[idxA].dist);
        if (approximate || this.samples[idxA].segIdx > this.samples[idxB].segIdx) {
            // We have a set of evenly spaced samples that are close enough together
            // that we can probably just linearly interpolate between them without
            // too much loss of quality
            let x = (1 - mix) * this.samples[idxA].tan.x + mix * this.samples[idxB].tan.x;
            let y = (1 - mix) * this.samples[idxA].tan.y + mix * this.samples[idxB].tan.y;
            const hypot = Math.max(Math.hypot(x, y), 1e-4);
            x /= hypot;
            y /= hypot;
            return { x, y };
        }
        else if (this.samples[idxA].segIdx !== this.samples[idxB].segIdx) {
            // Find the t value between the two samples. This is not EXACTLY the point
            // at the target distance along the path, but it's so close that it
            // is effectively the same
            if (mix < 0.5) {
                const segment = this.segments[this.samples[idxA].segIdx];
                const mixA = 2 * mix;
                const t = (1 - mixA) * this.samples[idxA].t + mixA;
                return segment.tangentAtParameter(t);
            }
            else {
                const segment = this.segments[this.samples[idxB].segIdx];
                const mixB = 2 * (mix - 0.5);
                const t = mixB * this.samples[idxB].t;
                return segment.tangentAtParameter(t);
            }
        }
        else {
            const segment = this.segments[this.samples[idxA].segIdx];
            const t = (1 - mix) * this.samples[idxA].t + mix * this.samples[idxB].t;
            return segment.tangentAtParameter(t);
        }
    }
}

// https://stackoverflow.com/questions/64945219/split-a-svg-path-d-to-array-of-objects
const PATH_COMMANDS = {
    M: ["x", "y"],
    m: ["dx", "dy"],
    H: ["x"],
    h: ["dx"],
    V: ["y"],
    v: ["dy"],
    L: ["x", "y"],
    l: ["dx", "dy"],
    Z: [],
    C: ["x1", "y1", "x2", "y2", "x", "y"],
    c: ["dx1", "dy1", "dx2", "dy2", "dx", "dy"],
    S: ["x2", "y2", "x", "y"],
    s: ["dx2", "dy2", "dx", "dy"],
    Q: ["x1", "y1", "x", "y"],
    q: ["dx1", "dy1", "dx", "dy"],
    T: ["x", "y"],
    t: ["dx", "dy"],
    A: ["rx", "ry", "rotation", "large-arc", "sweep", "x", "y"],
    a: ["rx", "ry", "rotation", "large-arc", "sweep", "dx", "dy"]
};
function fromPathToArray(path) {
    const items = path.replace(/[\n\r]/g, '').
        replace(/-/g, ' -').
        replace(/(\d*\.)(\d+)(?=\.)/g, '$1$2 ').
        replace(/(\d)([A-Za-z])/g, '$1 $2').
        replace(/([A-Za-z])(\d)/g, '$1 $2').
        trim().
        split(/\s*,|\s+/);
    const segments = [];
    let currentCommand = '';
    let currentElement = {};
    while (items.length > 0) {
        let it = items.shift();
        if (PATH_COMMANDS.hasOwnProperty(it)) {
            currentCommand = it;
        }
        else {
            items.unshift(it);
        }
        currentElement = { type: currentCommand };
        PATH_COMMANDS[currentCommand].forEach((prop) => {
            it = items.shift(); // TODO sanity check
            currentElement[prop] = parseFloat(it);
        });
        if (currentCommand === 'M') {
            currentCommand = 'L';
        }
        else if (currentCommand === 'm') {
            currentCommand = 'l';
        }
        segments.push(currentElement);
    }
    return segments;
}
const createFromPath = (el) => {
    const commands = fromPathToArray(el.getAttribute('d'));
    if (commands.length < 2) {
        throw new Error(`Path doesn't have enough commands: ${JSON.stringify(commands)}`);
    }
    if (commands[0].type !== 'M') {
        throw new Error(`Path starts with ${commands[0].type} instead of M!`);
    }
    let lastPoint = { x: commands[0].x, y: commands[0].y };
    commands.shift();
    const segments = [];
    while (commands.length > 0) {
        const command = commands.shift();
        if (command.type === 'C') {
            segments.push(new BezierSegment(lastPoint, { x: command.x1, y: command.y1 }, { x: command.x2, y: command.y2 }, { x: command.x, y: command.y }));
            lastPoint = { x: command.x, y: command.y };
        }
        else if (command.type === 'L') {
            segments.push(new BezierSegment(lastPoint, lastPoint, { x: command.x, y: command.y }, { x: command.x, y: command.y }));
            lastPoint = { x: command.x, y: command.y };
        }
        else if (command.type === 'H') {
            segments.push(new BezierSegment(lastPoint, lastPoint, { x: command.x, y: lastPoint.y }, { x: command.x, y: lastPoint.y }));
            lastPoint = { x: command.x, y: lastPoint.y };
        }
        else if (command.type === 'V') {
            segments.push(new BezierSegment(lastPoint, lastPoint, { x: lastPoint.x, y: command.y }, { x: lastPoint.x, y: command.y }));
            lastPoint = { x: lastPoint.x, y: command.y };
        }
        else if (command.type === 'Z') ;
        else {
            throw new Error(`Unsupported path command ${command.type}; use only H, V, M, L, C, Z!`);
        }
    }
    return new BezierPath(segments);
};
const createFromLine = (el) => {
    const [x1, x2, y1, y2] = ['x1', 'x2', 'y1', 'y2']
        .map((prop) => parseFloat(el.getAttribute(prop) || '0'));
    return new BezierPath([
        new BezierSegment({ x: x1, y: y1 }, { x: x1, y: y1 }, { x: x2, y: y2 }, { x: x2, y: y2 })
    ]);
};
const createFromCircle = (el) => {
    const [cx, cy, r] = ['cx', 'cy', 'r']
        .map((prop) => parseFloat(el.getAttribute(prop) || '0'));
    const k = 1.3;
    return new BezierPath([
        new BezierSegment({ x: cx - r, y: cy }, { x: cx - r, y: cy - k * r }, { x: cx + r, y: cy - k * r }, { x: cx + r, y: cy }),
        new BezierSegment({ x: cx + r, y: cy }, { x: cx + r, y: cy + k * r }, { x: cx - r, y: cy + k * r }, { x: cx - r, y: cy }),
    ]);
};
const createFromElement = (el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'path') {
        return createFromPath(el);
    }
    else if (tag === 'line') {
        return createFromLine(el);
    }
    else if (tag === 'circle') {
        return createFromCircle(el);
    }
    else {
        throw new Error(`Unsupported SVG tag: ${tag}`);
    }
};
const create = (points) => {
    const segments = [];
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        segments.push(new BezierSegment(prev.pt, prev.right || prev.pt, curr.left || curr.pt, curr.pt));
    }
    return new BezierPath(segments);
};
const createFromCommands = (rawCommands) => {
    const commands = rawCommands.slice();
    if (commands.length < 2) {
        throw new Error(`Path doesn't have enough commands: ${JSON.stringify(commands)}`);
    }
    if (commands[0].type !== 'M') {
        throw new Error(`Path starts with ${commands[0].type} instead of M!`);
    }
    let lastPoint = { x: commands[0].x, y: commands[0].y };
    let firstPoint = Object.assign({}, lastPoint);
    const segments = [];
    while (commands.length > 0) {
        const command = commands.shift();
        if (command.type === 'M') {
            firstPoint = {
                x: command.x,
                y: command.y,
            };
            lastPoint = firstPoint;
        }
        else if (command.type === 'C') {
            segments.push(new BezierSegment(lastPoint, { x: command.x1, y: command.y1 }, { x: command.x2, y: command.y2 }, { x: command.x, y: command.y }));
            lastPoint = { x: command.x, y: command.y };
        }
        else if (command.type === 'L') {
            if (command.x !== lastPoint.x || command.y !== lastPoint.y) {
                segments.push(new BezierSegment(lastPoint, lastPoint, { x: command.x, y: command.y }, { x: command.x, y: command.y }));
            }
            lastPoint = { x: command.x, y: command.y };
        }
        else if (command.type === 'H') {
            if (command.x !== lastPoint.x) {
                segments.push(new BezierSegment(lastPoint, lastPoint, { x: command.x, y: lastPoint.y }, { x: command.x, y: lastPoint.y }));
            }
            lastPoint = { x: command.x, y: lastPoint.y };
        }
        else if (command.type === 'V') {
            if (command.y !== lastPoint.y) {
                segments.push(new BezierSegment(lastPoint, lastPoint, { x: lastPoint.x, y: command.y }, { x: lastPoint.x, y: command.y }));
            }
            lastPoint = { x: lastPoint.x, y: command.y };
        }
        else if (command.type === 'Q') {
            segments.push(new BezierSegment(lastPoint, {
                x: lastPoint.x + (2 / 3) * (command.x1 - lastPoint.x),
                y: lastPoint.y + (2 / 3) * (command.y1 - lastPoint.y),
            }, {
                x: command.x + (2 / 3) * (command.x1 - command.x),
                y: command.y + (2 / 3) * (command.y1 - command.y),
            }, { x: command.x, y: command.y }));
            lastPoint = { x: command.x, y: command.y };
        }
        else if (command.type === 'Z') {
            if (Math.hypot(lastPoint.x - firstPoint.x, lastPoint.y - firstPoint.y) > 0) {
                segments.push(new BezierSegment(lastPoint, lastPoint, firstPoint, firstPoint));
            }
        }
        else {
            throw new Error(
            // @ts-ignore
            `Unsupported path command ${command.type}; use only H, V, M, L, C, Z!`);
        }
    }
    return new BezierPath(segments);
};

export { BezierPath, BezierSegment, create, createFromCircle, createFromCommands, createFromElement, createFromLine, createFromPath };
