import { cloneDeep, debounce, isEqual, last } from 'lodash-es';
import { deepObserve } from 'mobx-utils';
var History = /** @class */ (function () {
    function History(eventCenter) {
        this.undos = [];
        this.redos = [];
        this.stopWatch = null;
        this.curData = null;
        this.maxSize = 50;
        // 发生数据变化后，最多再等 500ms，把距离上次的数据变更存储起来。
        // 所以 waitTime 值越小，History 对数据变化越敏感，存的 undos 数据就越细
        this.waitTime = 100;
        this.eventCenter = eventCenter;
    }
    History.prototype.add = function (data) {
        if (isEqual(last(this.undos), data))
            return;
        this.undos.push(data);
        // 因为 undo 的时候会触发 add.
        // 所以需要区分这个 add 是 undo 触发的还是用户正常操作触发的
        // 如果是用户正常操作触发的，需要清空 redos
        if (!isEqual(this.curData, data)) {
            this.redos = [];
        }
        // this.eventCenter.emit(EventType.HISTORY_CHANGE, {
        //   data: {
        //     undos: this.undos,
        //     redos: this.redos,
        //     undoAble: this.undos.length > 1,
        //     redoAble: this.redos.length > 0,
        //   },
        // })
        if (this.undos.length > this.maxSize) {
            this.undos.shift();
        }
    };
    History.prototype.undoAble = function () {
        return this.undos.length > 1;
    };
    /**
     * undo 方法触发：
     * graphModel 重新渲染 nodes 和 edges
     * graphModel 发生变化，触发 watch
     * watch 触发 add
     */
    History.prototype.undo = function () {
        if (!this.undoAble())
            return;
        var preData = this.undos.pop();
        if (preData) {
            this.redos.push(preData);
        }
        var curData = this.undos.pop();
        if (curData) {
            this.curData = cloneDeep(curData);
        }
        return curData;
    };
    History.prototype.redoAble = function () {
        return this.redos.length > 0;
    };
    History.prototype.redo = function () {
        if (!this.redoAble())
            return;
        var curData = this.redos.pop();
        if (curData) {
            this.curData = cloneDeep(curData);
        }
        return curData;
    };
    History.prototype.watch = function (model) {
        var _this = this;
        this.stopWatch && this.stopWatch();
        // 把当前 watch 的 model 转换一下数据存起来，无需清空 redos
        var historyData = model.modelToHistoryData();
        if (historyData) {
            this.undos.push(historyData);
        }
        this.stopWatch = deepObserve(model, debounce(function () {
            // 数据变更后，把最新的当前 model 数据存起来，并清空 redos
            // 因为这个回调函数的触发，一般是用户交互而引起的，所以按照正常逻辑需要清空 redos
            var data = model.modelToHistoryData();
            if (data) {
                _this.add(data);
            }
        }, this.waitTime));
    };
    return History;
}());
export { History };
export default History;
