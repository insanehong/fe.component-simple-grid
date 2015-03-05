ne = window.ne || {};
ne.component = ne.component || {};

/**
 * @fileoverview 기본 클래스 파일
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * unique key 를 생성할 때 사용하는 key 값
 * @type {number}
 */
var uniqueKey = 0;

/**
 * Base Class
 * @constructor Base
 */
var Base = ne.util.defineClass(/**@lends Base.prototype */{
    init: function(options) {
        if (options && options.grid) {
            this.setOwnProperties({
                grid: options.grid
            });
        }
    },

   /**
    * 유일한 key 값을 생성한다.
    * @return {number}
    * @private
    */
    getUniqueKey: function() {
        return ++uniqueKey;
    },

    /**
     * 내부 프로퍼티를 설정한다.
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
     * @return {error} 에러 객체
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
 * @constructor Base.View
 */
Base.View = ne.util.defineClass(Base, /**@lends Base.View.prototype */{
    tagName: 'div',
    className: '',
    eventHandler: {},
    style: '',

    /**
     * 생성자
     * @param attributes
     */
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
            _viewList: [],
            _eventHandler: eventHandler,
            $el: $el,
            el: $el[0]
        });
        this._initializeStyle();
    },

    /**
     * style 이 설정되어있다면 default style 을 적용한다.
     * @private
     */
    _initializeStyle: function() {
        if (this.style) {
            this.$el.attr('style', this.style);
        }
    },

    /**
     * 이벤트 핸들러를 attach 또는 detach 한다.
     * @param {jQuery} [$target     ] 이벤트 핸들러의 대상 $target
     * @param {boolean} isAttach    attach 할 지 여부
     * @private
     */
    _dispatchHandler: function($target, isAttach) {
        $target = $target || this.$el;
        if ($target.length) {
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
        }
    },

    /**
     * event 를 attach 한다.
     * @param {jQuery} [$target]
     * @private
     */
    _attachHandler: function($target) {
        /* istanbul ignore next: dispatchHandler 에서 테스트 함 */
        this._dispatchHandler($target, true);
    },

    /**
     * event 를 detach 한다.
     * @param {jQuery} [$target]
     * @private
     */
    _detachHandler: function($target) {
        /* istanbul ignore next: dispatchHandler 에서 테스트 함 */
        this._dispatchHandler($target);
    },

     /**
     * create view
     * @param {function} constructor
     * @param {object} params
     * @return {object} instance
     */
    createView: function(constructor, params) {
        var instance = new constructor(params);
        if (!this.hasOwnProperty('_viewList')) {
            this.setOwnProperties({
                _viewList: []
            });
        }
        this._viewList.push(instance);
        return instance;
    },

    /**
     * destroyChildren
     */
    destroyChildren: function() {
        if (ne.util.isArray(this._viewList)) {
            while (this._viewList.length !== 0) {
                this._viewList.pop().destroy();
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
/**
 * Utility 메서드 모음
 * @type {{template: Function}}
 */
var Util = {
    /**
     * template 문자열을 치환하는 메서드
     * @param {String} template String
     * @param {Object} mapper
     * @return {String}
     * @example
     var template = '<div width="<%=width%>" height="<%=height%>">';
     Util.template(template, {
        width: 100,
        height: 200
     });

     ->
     '<div width="100" height="200">';
     */
    template: function(template, mapper) {
        template.replace(/<%=[^%]+%>/g, '');
        var replaced = template.replace(/<%=([^%]+)%>/g, function(matchedString, name, index, fullString) {
            return ne.util.isUndefined(mapper[name]) ? '' : mapper[name].toString();
        });
        return replaced;
    },

    /**
     * 행 개수와 한 행당 높이를 인자로 받아 테이블 body 의 전체 높이를 구한다.
     * @param {number} rowCount     행의 개수
     * @param {number} rowHeight    한 행의 높이
     * @param {number} border   테두리 값
     * @return {number}
     */
    getHeight: function(rowCount, rowHeight, border) {
        border = ne.util.isUndefined(border) ? 1 : border;
        return rowCount === 0 ? rowCount : rowCount * (rowHeight + border) + border;
    },

    /**
     *Table 의 높이와 행당 높이를 인자로 받아, table 에서 보여줄 수 있는 행 개수를 반환한다.
     *
     * @param {number} height   테이블 높이
     * @param {number} rowHeight    행의 높이
     * @return {number}
     */
    getDisplayRowCount: function(height, rowHeight) {
        return Math.ceil((height - 1) / (rowHeight + 1));
    },

    /**
     * Table 의 height 와 행 개수를 인자로 받아, 한 행당 높이를 구한다.
     *
     * @param {number} rowCount 행 개수
     * @param {number} height   테이블 높이
     * @return {number}
     */
    getRowHeight: function(rowCount, height) {
        return rowCount === 0 ? 0 : Math.floor(((height - 1) / rowCount)) - 1;
    },

    /**
     * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
     * @param {string} htmlString   html 마크업 문자열
     * @return {String} HTML tag 에 해당하는 부분을 제거한 문자열
     */
    stripTags: function(htmlString) {
        var matchResult;
        htmlString = htmlString.replace(/[\n\r\t]/g, '');
        if (ne.util.hasEncodableString(htmlString)) {
            if (/<img/i.test(htmlString)) {
                matchResult = htmlString.match(/<img[^>]*\ssrc=[\"']?([^>\"']+)[\"']?[^>]*>/i);
                htmlString = matchResult ? matchResult[1] : '';
            } else {
                htmlString = htmlString.replace(/<button.*?<\/button>/gi, '');
            }
            htmlString = $.trim(ne.util.decodeHTMLEntity(htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig, '')));
        }
        return htmlString;
    },

    /**
     * mac os 인지 확인한다.
     * @returns {boolean}
     */
    isMacOs: function() {
        return navigator.userAgent.indexOf('Macintosh') > 0;
    }
};
