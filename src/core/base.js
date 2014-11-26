    ne = window.ne || {};
    ne.Component = ne.Component || {};

    /**
     * @fileoverview base component file
     * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
     */

    /**
     * Base Class
     * @constructor
     */
    var Base = ne.util.defineClass({
        init: function(options) {
            if (options && options.grid) {
                this.setOwnProperties({
                    grid: options.grid
                });
            }
        },
        /**
        * Create unique key
        * @return {string}
        * @private
        */
        getUniqueKey: function() {
            var rand = String(parseInt(Math.random() * 10000000000, 10)),
                uniqueKey = new Date().getTime() + rand;
            return uniqueKey;
        },
        /**
         * set own properties
         * @param {object} properties
         * @return {Base}
         * @private
         */
        setOwnProperties: function(properties) {
            ne.util.forEach(properties, function(value, name) {
                this[name] = value;
            }, this);
            return this;
        },
        /**
         * error 객체를 리턴한다.
         * @param {string} msg
         * @return {error}
         */
        error: function(msg) {
            var error = function() {
                this.message = msg;
            };
            error.prototype = new Error();
            return new error();
        }
    });
    // 커스텀이벤트 믹스인
    ne.util.CustomEvents.mixin(Base);

    /**
     * View base class
     * @constructor
     */
    Base.View = ne.util.defineClass(Base, {
        tagName: 'div',
        className: '',
        eventHandler: {},
        init: function(attributes) {
            Base.prototype.init.apply(this, arguments);

            var eventHandler = {},
                $el = attributes && attributes.$el || $('<' + this.tagName + '>');

            $el.addClass(this.className);

            ne.util.forEach(this.eventHandler, function(methodName, eventName) {
                eventHandler[eventName] = $.proxy(this[methodName], this);
            }, this);

            this._attachHandler($el);

            if (attributes && attributes.model) {
                this.setOwnProperties({
                    model: attributes.model
                });
            }
            this.setOwnProperties({
                __viewList: [],
                _eventHandler: eventHandler,
                $el: $el,
                el: $el[0]
            });
        },
        /**
         * 이벤트 핸들러를 attach 또는 detach 한다.
         * @param {jQuery} $target      이벤트 핸들러의 대상 $target
         * @param {boolean} isAttach    attach 할 지 여부
         * @private
         */
        _dispatchHandler: function($target, isAttach) {
            $target = $target || this.$el;
            ne.util.forEach(this._eventHandler, function(handler, name) {
                var tmp = name.split(' '),
                    eventName = tmp[0],
                    selector = tmp[1] || '';

                if (selector) {
                    $target = $target.find(selector);
                }

                $target.off(eventName);

                if (isAttach) {
                    $target.on(eventName, handler);
                }
            }, this);
        },
        /**
         * event 를 attach 한다.
         * @param {jQuery} $target
         * @private
         */
        _attachHandler: function($target) {
            /* istanbul ignore next: dispatchHandler 에서 테스트 함 */
            this._dispatchHandler($target, true);
        },
        /**
         * event 를 detach 한다.
         * @param {jQuery} $target
         * @private
         */
        _detachHandler: function($target) {
            /* istanbul ignore next: dispatchHandler 에서 테스트 함 */
            this._dispatchHandler($target);
        },
         /**
         * create view
         * @param {class} constructor
         * @param {object} params
         * @return {object} instance
         */
        createView: function(constructor, params) {
            var instance = new constructor(params);
            if (!this.hasOwnProperty('__viewList')) {
                this.setOwnProperties({
                    __viewList: []
                });
            }
            this.__viewList.push(instance);
            return instance;
        },
        /**
         * destroyChildren
         */
        destroyChildren: function() {
            if (this.__viewList instanceof Array) {
                while (this.__viewList.length !== 0) {
                    this.__viewList.pop().destroy();
                }
            }
        },
        /**
         * destroy
         */
        destroy: function() {
            this.destroyChildren();
            this._detachHandler(this.$el);
            this.$el.empty().remove();
        }
    });
