import { Component, h } from 'preact';
import { createAtom, Reaction, _getGlobalState } from 'mobx';

function isStateless(component) {
    // `function() {}` has prototype, but `() => {}` doesn't
    // `() => {}` via Babel has prototype too.
    return !(component.prototype && component.prototype.render) && !Component.isPrototypeOf(component);
}

function makeDisplayName(component) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$prefix = _ref.prefix,
        prefix = _ref$prefix === undefined ? '' : _ref$prefix,
        _ref$suffix = _ref.suffix,
        suffix = _ref$suffix === undefined ? '' : _ref$suffix;

    var displayName = component.displayName || component.name || component.constructor && component.constructor.name || '<component>';
    return prefix + displayName + suffix;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var isUsingStaticRendering = false;

var logger = console; // eslint-disable-line no-console

function useStaticRendering(useStaticRendering) {
    isUsingStaticRendering = useStaticRendering;
}

/**
 Workaround

 allowStateChanges from mobX must be patched so that props, state and args are passed to the render() function
 */

function allowStateChangesStart(allowStateChanges) {
    var prev = _getGlobalState().allowStateChanges;
    _getGlobalState().allowStateChanges = allowStateChanges;
    return prev;
}
function allowStateChangesEnd(prev) {
    _getGlobalState().allowStateChanges = prev;
}

function allowStateChanges(allowStateChanges, func, props, state, context) {
    var prev = allowStateChangesStart(allowStateChanges);
    var res = void 0;
    try {
        res = func(props, state, context);
    } finally {
        allowStateChangesEnd(prev);
    }
    return res;
}

/**
 * Utilities
 */

function patch(target, funcName) {
    var runMixinFirst = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var base = target[funcName];
    var mixinFunc = reactiveMixin[funcName];
    var f = !base ? mixinFunc : runMixinFirst === true ? function () {
        mixinFunc.apply(this, arguments);
        base.apply(this, arguments);
    } : function () {
        base.apply(this, arguments);
        mixinFunc.apply(this, arguments);
    };

    // MWE: ideally we freeze here to protect against accidental overwrites in component instances, see #195
    // ...but that breaks react-hot-loader, see #231...
    target[funcName] = f;
}

function isObjectShallowModified(prev, next) {
    if (null == prev || null == next || (typeof prev === 'undefined' ? 'undefined' : _typeof(prev)) !== 'object' || (typeof next === 'undefined' ? 'undefined' : _typeof(next)) !== 'object') {
        return prev !== next;
    }
    var keys = Object.keys(prev);
    if (keys.length !== Object.keys(next).length) {
        return true;
    }
    var key = void 0;
    for (var i = keys.length - 1; key = keys[i]; i--) {
        if (next[key] !== prev[key]) {
            return true;
        }
    }
    return false;
}

/**
 * ReactiveMixin
 */
var reactiveMixin = {
    componentWillMount: function componentWillMount() {
        var _this = this;

        if (isUsingStaticRendering === true) {
            return;
        }
        // Generate friendly name for debugging
        var initialName = makeDisplayName(this);

        /**
         * If props are shallowly modified, react will render anyway,
         * so atom.reportChanged() should not result in yet another re-render
         */
        var skipRender = false;
        /**
         * forceUpdate will re-assign this.props. We don't want that to cause a loop,
         * so detect these changes
         */
        var isForcingUpdate = false;

        function makePropertyObservableReference(propName) {
            var valueHolder = this[propName];
            var atom = createAtom('reactive ' + propName);
            Object.defineProperty(this, propName, {
                configurable: true,
                enumerable: true,
                get: function get$$1() {
                    atom.reportObserved();
                    return valueHolder;
                },
                set: function set$$1(v) {
                    if (!isForcingUpdate && isObjectShallowModified(valueHolder, v)) {
                        valueHolder = v;
                        skipRender = true;
                        atom.reportChanged();
                        skipRender = false;
                    } else {
                        valueHolder = v;
                    }
                }
            });
        }

        // make this.props an observable reference, see #124
        makePropertyObservableReference.call(this, 'props');
        // make state an observable reference
        makePropertyObservableReference.call(this, 'state');

        // wire up reactive render
        var baseRender = this.render.bind(this);
        var reaction = null;
        var isRenderingPending = false;

        var initialRender = function initialRender() {
            reaction = new Reaction(initialName + '.render()', function () {
                if (!isRenderingPending) {
                    // N.B. Getting here *before mounting* means that a component constructor has side effects (see the relevant test in misc.js)
                    // This unidiomatic React usage but React will correctly warn about this so we continue as usual
                    // See #85 / Pull #44
                    isRenderingPending = true;
                    if (typeof _this.componentWillReact === 'function') {
                        _this.componentWillReact();
                    } // TODO: wrap in action?
                    if (_this.__$mobxIsUnmounted !== true) {
                        // If we are unmounted at this point, componentWillReact() had a side effect causing the component to unmounted
                        // TODO: remove this check? Then react will properly warn about the fact that this should not happen? See #73
                        // However, people also claim this migth happen during unit tests..
                        var hasError = true;
                        try {
                            isForcingUpdate = true;
                            if (!skipRender) {
                                Component.prototype.forceUpdate.call(_this);
                            }
                            hasError = false;
                        } finally {
                            isForcingUpdate = false;
                            if (hasError) {
                                reaction.dispose();
                            }
                        }
                    }
                }
            });
            reaction.reactComponent = _this;
            reactiveRender.$mobx = reaction;
            _this.render = reactiveRender;
            return reactiveRender(_this.props, _this.state, _this.context);
        };

        var reactiveRender = function reactiveRender(props, state, context) {
            isRenderingPending = false;
            var exception = undefined;
            var rendering = undefined;
            reaction.track(function () {
                try {
                    rendering = allowStateChanges(false, baseRender, props, state, context);
                } catch (e) {
                    exception = e;
                }
            });
            if (exception) {
                throw exception;
            }
            return rendering;
        };

        this.render = initialRender;
    },

    componentWillUnmount: function componentWillUnmount() {
        if (isUsingStaticRendering === true) {
            return;
        }
        this.render.$mobx && this.render.$mobx.dispose();
        this.__$mobxIsUnmounted = true;
    },

    componentDidMount: function componentDidMount() {},

    componentDidUpdate: function componentDidUpdate() {},

    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        if (isUsingStaticRendering) {
            logger.warn('[mobx-preact] It seems that a re-rendering of a React component is triggered while in static (server-side) mode. Please make sure components are rendered only once server-side.');
        }
        // update on any state changes (as is the default)
        if (this.state !== nextState) {
            return true;
        }
        // update if props are shallowly not equal, inspired by PureRenderMixin
        // we could return just 'false' here, and avoid the `skipRender` checks etc
        // however, it is nicer if lifecycle events are triggered like usually,
        // so we return true here if props are shallowly modified.
        return isObjectShallowModified(this.props, nextProps);
    }
};

/**
 * Observer function / decorator
 */
function observer(componentClass) {
    if (arguments.length > 1) {
        logger.warn('Mobx observer: Using observer to inject stores is not supported. Use `@connect(["store1", "store2"]) ComponentClass instead or preferably, use `@inject("store1", "store2") @observer ComponentClass` or `inject("store1", "store2")(observer(componentClass))``');
    }

    if (componentClass.isMobxInjector === true) {
        logger.warn('Mobx observer: You are trying to use \'observer\' on a component that already has \'inject\'. Please apply \'observer\' before applying \'inject\'');
    }

    // Stateless function component:
    if (isStateless(componentClass)) {
        var _class, _temp;

        return observer((_temp = _class = function (_Component) {
            inherits(_class, _Component);

            function _class() {
                classCallCheck(this, _class);
                return possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
            }

            createClass(_class, [{
                key: 'render',
                value: function render() {
                    return componentClass.call(this, this.props, this.context);
                }
            }]);
            return _class;
        }(Component), _class.displayName = makeDisplayName(componentClass), _temp));
    }

    if (!componentClass) {
        throw new Error('Please pass a valid component to \'observer\'');
    }

    var target = componentClass.prototype || componentClass;
    mixinLifecycleEvents(target);
    componentClass.isMobXReactObserver = true;
    return componentClass;
}

function mixinLifecycleEvents(target) {
    patch(target, 'componentWillMount', true);
    patch(target, 'componentDidMount');

    if (!target.shouldComponentUpdate) {
        target.shouldComponentUpdate = reactiveMixin.shouldComponentUpdate;
    }
}

var Observer = observer(function (_ref) {
    var children = _ref.children;
    return children[0]();
});

Observer.displayName = 'Observer';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var hoistNonReactStatics = createCommonjsModule(function (module, exports) {
/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
(function (global, factory) {
    module.exports = factory();
}(commonjsGlobal, (function () {
    
    var REACT_STATICS = {
        childContextTypes: true,
        contextTypes: true,
        defaultProps: true,
        displayName: true,
        getDefaultProps: true,
        getDerivedStateFromProps: true,
        mixins: true,
        propTypes: true,
        type: true
    };
    
    var KNOWN_STATICS = {
        name: true,
        length: true,
        prototype: true,
        caller: true,
        callee: true,
        arguments: true,
        arity: true
    };
    
    var defineProperty = Object.defineProperty;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var getPrototypeOf = Object.getPrototypeOf;
    var objectPrototype = getPrototypeOf && getPrototypeOf(Object);
    
    return function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
        if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
            
            if (objectPrototype) {
                var inheritedComponent = getPrototypeOf(sourceComponent);
                if (inheritedComponent && inheritedComponent !== objectPrototype) {
                    hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
                }
            }
            
            var keys = getOwnPropertyNames(sourceComponent);
            
            if (getOwnPropertySymbols) {
                keys = keys.concat(getOwnPropertySymbols(sourceComponent));
            }
            
            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                if (!REACT_STATICS[key] && !KNOWN_STATICS[key] && (!blacklist || !blacklist[key])) {
                    var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
                    try { // Avoid failures from read-only properties
                        defineProperty(targetComponent, key, descriptor);
                    } catch (e) {}
                }
            }
            
            return targetComponent;
        }
        
        return targetComponent;
    };
})));
});

var proxiedInjectorProps = {
    isMobxInjector: {
        value: true,
        writable: true,
        configurable: true,
        enumerable: true
    }
};

/**
 * Store Injection
 */
function createStoreInjector(grabStoresFn, component, injectNames) {
    var _class, _temp;

    var prefix = 'inject-';
    var suffix = injectNames ? '-with-' + injectNames : '';
    var displayName = makeDisplayName(component, { prefix: prefix, suffix: suffix });

    var Injector = (_temp = _class = function (_Component) {
        inherits(Injector, _Component);

        function Injector() {
            classCallCheck(this, Injector);
            return possibleConstructorReturn(this, (Injector.__proto__ || Object.getPrototypeOf(Injector)).apply(this, arguments));
        }

        createClass(Injector, [{
            key: 'render',
            value: function render() {
                // Optimization: it might be more efficient to apply the mapper function *outside* the render method
                // (if the mapper is a function), that could avoid expensive(?) re-rendering of the injector component
                // See this test: 'using a custom injector is not too reactive' in inject.js
                var newProps = {};
                for (var key in this.props) {
                    if (this.props.hasOwnProperty(key)) {
                        newProps[key] = this.props[key];
                    }
                }
                var additionalProps = grabStoresFn(this.context.mobxStores || {}, newProps, this.context) || {};
                for (var _key in additionalProps) {
                    newProps[_key] = additionalProps[_key];
                }

                return h(component, newProps);
            }
        }]);
        return Injector;
    }(Component), _class.displayName = displayName, _temp);

    // Static fields from component should be visible on the generated Injector

    hoistNonReactStatics(Injector, component);

    Injector.wrappedComponent = component;
    Object.defineProperties(Injector, proxiedInjectorProps);

    return Injector;
}

function grabStoresByName(storeNames) {
    return function (baseStores, nextProps) {
        storeNames.forEach(function (storeName) {
            // prefer props over stores
            if (storeName in nextProps) {
                return;
            }
            if (!(storeName in baseStores)) {
                throw new Error('MobX injector: Store \'' + storeName + '\' is not available! Make sure it is provided by some Provider');
            }
            nextProps[storeName] = baseStores[storeName];
        });
        return nextProps;
    };
}

/**
 * higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
function inject() /* fn(stores, nextProps) or ...storeNames */{
    var grabStoresFn = void 0;
    if (typeof arguments[0] === 'function') {
        grabStoresFn = arguments[0];
        return function (componentClass) {
            var injected = createStoreInjector(grabStoresFn, componentClass);
            injected.isMobxInjector = false; // suppress warning
            // mark the Injector as observer, to make it react to expressions in `grabStoresFn`,
            // see #111
            injected = observer(injected);
            injected.isMobxInjector = true; // restore warning
            return injected;
        };
    } else {
        var storeNames = [];
        for (var i = 0; i < arguments.length; i++) {
            storeNames[i] = arguments[i];
        }
        grabStoresFn = grabStoresByName(storeNames);
        return function (componentClass) {
            return createStoreInjector(grabStoresFn, componentClass, storeNames.join('-'));
        };
    }
}

function connect(arg1, arg2) {
    if (typeof arg1 === 'string') {
        throw new Error('Store names should be provided as array');
    }
    if (Array.isArray(arg1)) {
        if (!arg2) {
            // invoked as decorator
            return function (componentClass) {
                return connect(arg1, componentClass);
            };
        } else {
            return inject.apply(null, arg1)(connect(arg2));
        }
    }
    return observer(arg1);
}

var specialReactKeys = { children: true, key: true, ref: true };

var logger$1 = console; // eslint-disable-line no-console

var Provider = function (_Component) {
    inherits(Provider, _Component);

    function Provider() {
        classCallCheck(this, Provider);
        return possibleConstructorReturn(this, (Provider.__proto__ || Object.getPrototypeOf(Provider)).apply(this, arguments));
    }

    createClass(Provider, [{
        key: 'render',
        value: function render(_ref) {
            var children = _ref.children;

            return children.length > 1 ? h(
                'div',
                null,
                ' ',
                children,
                ' '
            ) : children[0];
        }
    }, {
        key: 'getChildContext',
        value: function getChildContext() {
            var stores = {};
            // inherit stores
            var baseStores = this.context.mobxStores;
            if (baseStores) {
                for (var key in baseStores) {
                    stores[key] = baseStores[key];
                }
            }
            // add own stores
            for (var _key in this.props) {
                if (!specialReactKeys[_key] && _key !== 'suppressChangedStoreWarning') {
                    stores[_key] = this.props[_key];
                }
            }

            return {
                mobxStores: stores
            };
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            // Maybe this warning is too aggressive?
            if (Object.keys(nextProps).length !== Object.keys(this.props).length) {
                logger$1.warn('MobX Provider: The set of provided stores has changed. Please avoid changing stores as the change might not propagate to all children');
            }
            if (!nextProps.suppressChangedStoreWarning) {
                for (var key in nextProps) {
                    if (!specialReactKeys[key] && this.props[key] !== nextProps[key]) {
                        logger$1.warn('MobX Provider: Provided store \'' + key + '\' has changed. Please avoid replacing stores as the change might not propagate to all children');
                    }
                }
            }
        }
    }]);
    return Provider;
}(Component);

if (!Component) {
    throw new Error('mobx-preact requires Preact to be available');
}

export { observer, Observer, useStaticRendering, connect, inject, Provider };
