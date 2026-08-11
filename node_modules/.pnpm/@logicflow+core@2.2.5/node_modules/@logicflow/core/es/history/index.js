var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { debounce, isEqual, last, cloneDeep } from 'lodash-es';
import { deepObserve } from 'mobx-utils';
import { EventType } from '../constant';
var History = /** @class */ (function () {
    function History(eventCenter) {
        this.undos = [];
        this.redos = [];
        this.callbacks = [];
        this.stopWatch = null;
        this.curData = null;
        this.maxSize = 50;
        // 发生数据变化后，最多再等500ms，把距离上次的数据变更存储起来。
        // 所以waitTime值越小，History对数据变化越敏感，存的undos就越细。
        this.waitTime = 100;
        this.eventCenter = eventCenter;
    }
    History.prototype.add = function (data) {
        if (isEqual(last(this.undos), data))
            return;
        this.undos.push(data);
        // 因为undo的时候，会触发add.
        // 所以需要区分这个add是undo触发的，还是用户正常操作触发的。
        // 如果是用户正常操作触发的，需要清空redos
        if (!isEqual(this.curData, data)) {
            this.redos = [];
        }
        this.eventCenter.emit(EventType.HISTORY_CHANGE, {
            data: {
                undos: this.undos,
                redos: this.redos,
                undoAble: this.undoAble(),
                redoAble: this.redoAble(),
            },
        });
        if (this.undos.length > this.maxSize) {
            this.undos.shift();
        }
    };
    History.prototype.undoAble = function () {
        // undos栈顶就是当前图渲染出来的数据。
        return this.undos.length > 1;
    };
    // 1) undo方法触发
    // 2) graphModel重新渲染nodes和edges
    // 3) graphModel发生变化，触发watch
    // 4) watch触发add
    History.prototype.undo = function () {
        if (!this.undoAble())
            return;
        var preData = this.undos.pop();
        this.redos.push(preData);
        var curData = this.undos.pop();
        this.curData = cloneDeep(curData);
        return curData;
    };
    History.prototype.redoAble = function () {
        return this.redos.length > 0;
    };
    History.prototype.redo = function () {
        if (!this.redoAble())
            return;
        var curData = this.redos.pop();
        this.curData = cloneDeep(curData);
        return curData;
    };
    History.prototype.watch = function (model) {
        var _this = this;
        this.stopWatch && this.stopWatch();
        // 把当前watch的model转换一下数据存起来，无需清空redos。
        this.undos.push(model.modelToGraphData());
        this.stopWatch = deepObserve(
        // TODO：避免用户触发「The same observable object cannot appear twice in the same tree」 错误
        // 例如：在自定义节点的 setAttributes 方法中，将 nodeModel 属性赋值给另一个 observable 属性
        // eg:
        // setAttributes() {
        //   this.width = 120
        //   this.height = 50
        //
        //   if (this.text) {
        //     this.properties.text = this.text;
        //     this.text.value = '';
        //   }
        // }
        // 解决方案：使用 cloneDeep 方法，将 observable 对象克隆一份。需要测试下面操作是否会造成其它问题
        // https://stackoverflow.com/questions/55328504/a-node-cannot-exists-twice-in-the-state-tree-mobx-state-tree
        // cloneDeep(model),
        model, debounce(function () {
            // 数据变更后，把最新的当前model数据存起来，并清空 redos。
            // 因为这个回调函数的触发，一般是用户交互而引起的，所以按正常逻辑需要清空 redos。
            var data = model.modelToHistoryData();
            if (data) {
                _this.add(__assign({}, data));
            }
        }, this.waitTime));
    };
    History.prototype.destroy = function () {
        this.undos = [];
        this.redos = [];
        this.curData = null;
        this.stopWatch && this.stopWatch();
    };
    return History;
}());
export { History };
export default History;
