/*!simple-grid v1.0.0a | NHN Entertainment*/
(function() {
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
    }
};

/**
 * @fileoverview 원본데이터 콜렉션 클래스
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * 원본 데이터 collection
 * @constructor Collection
 */
var Collection = ne.util.defineClass(Base, /**@lends Collection.prototype */{
    init: function() {
        Base.prototype.init.apply(this, arguments);
        this.setOwnProperties({
            maxLength: 0,
            list: [],
            map: {},
            length: 0,
            idx: 0,
            worker: new Worker()
        });

        this.on('change', this._onChange, this);
    },

    /**
     * 사용자 action 이 발생했을 때에 데이터 상태보존을 위해 lock 한다.
     */
    lock: function() {
       this.worker.lock();
    },

    /**
     * 사용자 action 이 종료되면 lock 을 해제하고 적재된 명령을 한번에 수행한다.
     */
    unlock: function() {
        this.worker.unlock();
    },

    /**
     * 데이터가 set 을 사용하여 변경되었을 때, 이벤트 핸들러
     * @private
     */
    _onChange: function() {
        this.length = this.list.length;
    },

    /**
     * collection 값을 설정한다.
     * @param {Array} list  콜랙션 list
     */
    set: function(list) {
        this.worker.enqueue(this._set, arguments, this);
    },

    /**
     * set enqueue 할 내부 함수
     * @param {Array} list  콜랙션 list
     * @private
     */
    _set: function(list) {
        this.list = this._getFormattedList(list);
        if (this.maxLength > 0 && this.list.length > this.maxLength) {
            this._removeMap(0, this.list.length - this.maxLength);
            this.list = this.list.slice(this.list.length - this.maxLength, this.list.length);
        }
        this.invoke('change', {
            'type': 'set',
            'list': list
        });
    },

    /**
     * 사용하지 않는 Map 을 제거한다.
     * @param {number} start    제거 시작 index
     * @param {number} end      제거 끝 index
     * @private
     */
    _removeMap: function(start, end) {
        var i,
            id;
        for (i = start; i < end; i++) {
            id = this.list[i].id;
            this.map[id] = undefined;
            delete this.map[id];
        }
    },

    /**
     * 배열을 collection 에 맞는 형태로 가공하여 map 에 저장하고, 가공된 배열을 반환한다.
     * @param {Array} list
     * @return {Array}  사용할 수 있는 포멧의 데이터 리스트
     * @private
     */
    _getFormattedList: function(list) {
        var obj,
            id,
            idAttribute = this.grid.option('idAttribute'),
            formattedList = [],
            hasIdAttribute = !!idAttribute;

        ne.util.forEachArray(list, function(data) {
            id = hasIdAttribute ? data[idAttribute] : this.idx++;
            obj = {
                //id: this._getId(data),
                id: id,
                data: data
            };
            formattedList.push(obj);
            this.map[obj.id] = obj;
        }, this);
        return formattedList;
    },

    /**
     * 배열에서 index 에 해당하는 데이터를 반환한다.
     * @param {number} index 인덱스
     * @return {*}  index 에 해당하는 데이터
     */
    at: function(index) {
        return this.list[index];
    },

    /**
     * 맵에서 id 에 해당하는 데이터를 반환한다.
     * @param {(number|string)} id
     * @return {*}
     */
    get: function(id) {
        return this.map[id];
    },

    /**
     * 데이터를 입력받아 데이터가 존재하는 index 를 반환한다.
     * @param {object} obj
     * @return {number}
     */
    indexOf: function(obj) {
        var index = -1;
        if (!(obj && obj.id !== undefined)) {
            return -1;
        } else {

            ne.util.forEachArray(this.list, function(data, i) {
                if (data && data.id.toString() === obj.id.toString()) {
                    index = i;
                    return false;
                }
            }, this);
            return index;
        }

    },

    /**
     * collection 에 data Array 를  append 한다.
     * @param {Array} list
     */
    append: function(list) {
        this.worker.enqueue(this._append, arguments, this);
    },

    /**
     * append enqueue 할 내부 함수
     * @param {Array} list
     * @private
     */
    _append: function(list) {
        list = this._getFormattedList(list);
        this.list = this.list.concat(list);
        if (this.maxLength > 0 && this.list.length > this.maxLength) {
            this._removeMap(0, this.list.length - this.maxLength);
            this.list = this.list.slice(this.list.length - this.maxLength, this.list.length);
        }
        this.invoke('change', {
            type: 'append',
            list: this.list,
            appended: list
        });
    },

    /**
     * collection 에 data Array 를  prepend 한다.
     * @param {Array} list
     */
    prepend: function(list) {
        this.worker.enqueue(this._prepend, arguments, this);
    },

    /**
     * prepend enqueue 할 내부 함수
     * @param {Array} list
     * @private
     */
    _prepend: function(list) {
        list = this._getFormattedList(list);
        this.list = list.concat(this.list);
        if (this.maxLength > 0 && this.list.length > this.maxLength) {
            this._removeMap(this.maxLength, this.list.length);
            this.list = this.list.slice(0, this.maxLength);
        }

        this.invoke('change', {
            type: 'prepend',
            list: this.list,
            prepended: list
        });
    },

    /**
     * key 에 해당하는 data 를 제거한다.
     * @param {String|Array} id 삭제할 데이터의 key. 복수개일때 array 를 인자로 넘긴다.
     */
    remove: function(id) {
        this.worker.enqueue(this._remove, arguments, this);
    },

    /**
     * 실제 데이터를 삭제한다.
     * @param {String|Array} id id 삭제할 데이터의 key. 복수개일때 array 를 인자로 넘긴다.
     * @private
     */
    _remove: function(id) {
        var idList = ne.util.isArray(id) ? id : [id];

        ne.util.forEachArray(idList, function(id) {
            var index = this.indexOf(this.get(id));
            this.map[id] = undefined;
            delete this.map[id];
            this.list.splice(index, 1);
        }, this);

        this.invoke('change', {
            type: 'remove',
            list: this.list
        });
    },

    /**
     * collection 을 초기화한다.
     */
    clear: function() {
        this.worker.enqueue(this._clear, arguments, this);
    },

    /**
     * clear enqueue 할 내부 함수
     * @private
     */
    _clear: function() {
        this.list = [];
        this.map = {};
        this.invoke('change', {
            type: 'clear',
            list: this.list,
            idx: 0
        });
    }
});


/**
 * @fileoverview 큐를 이용한 Job Worker
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Collection job Worker
 * @constructor Worker
 */
var Worker = ne.util.defineClass(Base, /**@lends Worker.prototype */{
    init: function() {
        Base.prototype.init.apply(this, arguments);
        this.setOwnProperties({
            locked: false,
            queue: []
        });
    },

    /**
     * worker 에 lock 을 건다.
     * 이 때 job 들은 queue 에 적재되어 unlock 시 한번에 수행된다.
     */
    lock: function() {
        this.locked = true;
    },

    /**
     * lock을 해제하며 queue 에 적재된 job을 수행한다.
     * @param {boolean} skipRunQueue  runQueue 를 수행할지 여부
     */
    unlock: function(skipRunQueue) {
        if (!skipRunQueue) {
            this.runQueue();
        }
        this.locked = false;
    },

    /**
     * queue 에 job을 적재한다.
     * @param {Function} job   수행할 작업
     * @param {Array} args      arguments
     * @param {context} context 컨텍스트
     */
    enqueue: function(job, args, context) {
        if (this.locked) {
            this.queue.push({
                job: job,
                args: args,
                context: context
            });
        } else {
            job.apply(context, args);
        }
    },

    /**
     * dequeue 한다.
     * @return {{job: Function, args: Array, context: context}}
     */
    dequeue: function() {
        return this.queue.shift();
    },

    /**
     * 적재된 queue 의 job 들을 전부 수행 한다.
     */
    runQueue: function() {
        var item = this.dequeue();
        while (item) {
            item.job.apply(item.context, item.args);
            item = this.dequeue();
        }
    }
});

/**
 * @fileoverview 원본 Data를 한번 가공하여 View 에서 사용할 수 있는 데이터 구조를 담고 있는 클래스 모음
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * View 에서 참조하여 rendering 하도록, 원본 데이터를 가공한 render model
 * @constructor Focus
 */
var Focus = ne.util.defineClass(Base, /**@lends Focus.prototype */{
    /**
     * 초기화
     * @param {Object} options
     *      @param {Boolean} [options.isMultiple=false] 다중 선택할지 여부
     */
    init: function(options) {
        Base.prototype.init.apply(this, arguments);
        this.setOwnProperties({
            selectMap: {},
            isMultiple: options && options.isMultiple || false
        });
    },

    /**
     * 선택된 영역의 list 를 반환한다.
     * @return {Array}  선택 영역의 list
     */
    getSelectList: function() {
        return ne.util.keys(this.selectMap);
    },

    /**
     * 행을 선택한다.
     * @param {(Number|String)} key 해당하는 row의 키값
     */
    select: function(key) {
        if (!this.isMultiple) {
            ne.util.forEach(this.selectMap, function(value, key) {
                this.unselect(key);
            }, this);
        }
        this.selectMap[key] = true;
        this.fire('select', key, this.selectMap);
    },

    /**
     * 행을 선택 해제한다.
     * @param {(String|Number)} [key] 지정되지 않았다면 모든 select 를 초기화한다.
     */
    unselect: function(key) {
        if (ne.util.isUndefined(key)) {
            ne.util.forEach(this.selectMap, function(val, key) {
                this.unselect(key);
            }, this);
        } else {
            this.selectMap[key] = null;
            delete this.selectMap[key];
            this.fire('unselect', key, this.selectMap);
        }
    }
});

/**
 * @fileoverview 원본 Data를 한번 가공하여 View 에서 사용할 수 있는 데이터 구조를 담고 있는 클래스 모음
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * View 에서 참조하여 rendering 하도록, 원본 데이터를 가공한 render model
 * @constructor Model
 */
var Model = ne.util.defineClass(Base, /**@lends Model.prototype */{
    /**
     * 생성자
     * @param attributes
     */
    init: function(attributes) {
        Base.prototype.init.apply(this, arguments);
        this._initializeVariables();
        this._setHeight();
        this.collection.on({
            'change': this._onCollectionChange
        }, this);
        this.on({
            'change': this._onChange
        }, this);
        this._calculateColumnWidthList();
    },

    /**
     * 인스턴스 생성시 변수를 초기화한다.
     * @private
     */
    _initializeVariables: function() {
        this.setOwnProperties({
            collection: new Collection({grid: this.grid}),          //원본 데이터 collection
            offsetTop: 0,
            offsetLeft: 0,
            width: 0,
            height: 0,
            minimumColumnWidth: this.grid.option('minimumColumnWidth'),
            headerHeight: this.grid.option('headerHeight'),
            containerHeight: 0,
            containerWidth: 0,
            stopChangeEvent: false,
            freeze: false,
            rowHeight: this.grid.option('rowHeight') || 0,
            scrollTop: 0,
            scrollLeft: 0,
            maxScrollTop: 0,
            startIdx: 0,
            endIdx: 0,
            top: 0,
            list: [],
            hiddenLineCount: 10,   //스마트 랜더링시 한번에 랜더링할 숨겨진 행의 개수 (상단, 하단 각각의 행 개수)
            criticalPoint: 3       //스크롤 시 숨겨진 행의 개수가 criticalPoint 만큼 남았다면 다음 페이지 랜더링을 시도 한다.
        });
    },

    /**
     * clear 시 변수를 리셋 한다.
     * @private
     */
    _resetVariables: function() {
        this.set({
            stopChangeEvent: false,
            freeze: false,
            headerHeight: this.grid.option('headerHeight'),
            rowHeight: this.grid.option('rowHeight') || 0,
            scrollTop: 0,
            scrollLeft: 0,
            maxScrollTop: 0,
            startIdx: 0,
            endIdx: 0,
            top: 0,
            list: []
        });
    },

    /**
     * 원본 데이터 collection 이 변경 되었을 경우 이벤트 핸들러
     * @param {Object} changeEvent Collection 에서 발생한 Change 이벤트
     * @private
     */
    _onCollectionChange: function(changeEvent) {
        var type = changeEvent.type;
        this.stopChangeEvent = true;

        switch (type) {
            case 'clear':
                this._resetVariables();
                this._refresh();
                break;
            case 'prepend':
                this._doFreeze(changeEvent.prepended);
                this._refresh();
                break;
            case 'set':
                this._refresh();
                break;
            case 'append':
                this._refresh();
                break;
            case 'remove':
                this._refresh();
                break;
            default :
                break;
        }
        this.stopChangeEvent = false;
        this._fireChangeEvents({
            top: this.top,
            list: this.list,
            scrollTop: this.scrollTop
        });
    },

    /**
     * 한번에 여러 change event 를 발생한다.
     * @param {object} dataSets 이벤트 데이터 Key-Value 데이터 쌍
     * @private
     */
    _fireChangeEvents: function(dataSets) {
        ne.util.forEach(dataSets, function(value, key) {
            this.invoke('change', {
                key: key,
                value: value
            });
        }, this);
    },

    /**
     * 자기 스스로에 대한 onChange 이벤트 핸들러
     * @param {{key: key, value: value}} changeEvent 자기 자신이 발생하는 Change 이벤트 핸들러
     * @private
     */
    _onChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;

        switch (key) {
            case 'scrollTop':
                this._onScrollTopChange(value);
                break;
            case 'scrollLeft':
                this._onScrollLeftChange(value);
                break;
            case 'rowHeight':
                this.collection.maxLength = this._getMaxCollectionLength();
                break;
            case 'containerHeight':
                this.collection.maxLength = this._getMaxCollectionLength();
                break;
            case 'containerWidth':
                this._calculateColumnWidthList();
                break;
        }
    },

    /**
     * scrollLeft 값이 변경되었을 때 scrollLeft 값 관련 처리
     * @param {number} value 변경된 scrollLeft 값
     * @private
     */
    _onScrollLeftChange: function(value) {
        if (value < 0) {
            this.set('scrollLeft', 0);
        }
    },

    /**
     * scrollTop 이 변경되었을 때 rendering 관련 처리
     * @param {number} value 변경된 scrollTop 값
     * @private
     */
    _onScrollTopChange: function(value) {
        if (this.maxScrollTop < value) {
            this.set('scrollTop', this.maxScrollTop, {silent: true});
        } else if (value < 0) {
            this.set('scrollTop', 0, {silent: true});
        } else {
            if (this._isRenderable()) {
                this._refresh();
            }
        }
    },

    /**
     * IE 에서 div height max 제한으로 인해 maxCollection length 를 반환한다.
     * @private
     */
    _getMaxCollectionLength: function() {
        var border = +this.grid.option('border') || 0;

        if (ne.util.browser.msie) {
            //1533917 is the max height of IE (66692*23 + 1)
            return Math.floor(this.grid.ieMaxHeight / (this.rowHeight + border));
        } else {
            return 0;
        }
    },

    /**
     * maxScrollTop 값을 계산하여 반환한다.
     * @return {number} maxScrollTop 값
     */
    getMaxScrollTop: function() {
        var border = this.grid.option('border'),
            maxScrollTop = Util.getHeight(this.collection.length, this.rowHeight, border) - this.containerHeight;

        if (this.grid.option('scrollX')) {
            maxScrollTop += this.grid.scrollBarSize;
        }

        return Math.max(maxScrollTop, 0);
    },

    /**
     * 값을 설정한다.
     * @param {*} key   키값. Object 형태로 들어올 경우, {key1: value1, key2: value2} 와 같이 다수의 키값을 설정할 수 있다.
     * @param {*} [value] 키에 할당할 값. 첫번째 파라미터에 Object 타입으로 인자를 넘겨주었을 경우 무시된다.
     * @param {{silent: boolean}} [options] silent 값이 true 일 경우 이벤트를 발생하지 않는다.
     */
    set: function(key, value, options) {
        if (ne.util.isObject(key)) {
            ne.util.forEach(key, function(val, key) {
                this.set(key, val, value);
            }, this);
        } else {
            if (this[key] != value) {
                this[key] = value;

                if (!(options && options.silent) && !this.stopChangeEvent) {
                    this.invoke('change', {
                        key: key,
                        value: value
                    });
                }
            }
        }
    },

    /**
     * 높이를 계산하여 설정한다.
     * @private
     */
    _setHeight: function() {
        var height;

        if (ne.util.isExisty(this.grid.option('height'))) {
            height = this.grid.option('height');
            if (this.grid.option('scrollX')) {
                height -= this.grid.scrollBarSize;
            }
        } else {
            height = Util.getHeight(this.grid.option('displayCount'), this.grid.option('rowHeight'), this.grid.option('border'));
        }

        this.set('height', height);
    },

    /**
     * rendering 시 필요한 데이터를 갱신한다.
     * @private
     */
    _refresh: function() {
        var renderData = this._getRenderingData(),
            list = this.collection.list.slice(renderData.startIdx, renderData.endIdx);

        this.set({
            startIdx: renderData.startIdx,
            endIdx: renderData.endIdx,
            list: list,
            top: renderData.top
        });

        this.invoke('refresh');
    },

    /**
     * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
     * @param {Number} index    너비를 변경할 컬럼의 인덱스
     * @param {Number} width    변경할 너비 pixel값
     */
    setColumnWidth: function(index, width) {
        width = Math.max(width, this.minimumColumnWidth);

        var curColumnWidthList = ne.util.extend([], this.columnWidthList);

        if (!ne.util.isUndefined(curColumnWidthList[index])) {
            curColumnWidthList[index] = width;
            this._calculateColumnWidthList(curColumnWidthList);
        }
    },

    /**
     * columnWidthList 를 계산하여 저장한다.
     * @private
     */
    _calculateColumnWidthList: function(columnWidthList) {
        columnWidthList = columnWidthList || [];
        var columnModelList = this.grid.option('columnModelList'),
            defaultColumnWidth = this.grid.option('defaultColumnWidth'),
            minimumColumnWidth = this.grid.option('minimumColumnWidth'),
            border = this.grid.option('border'),
            frameWidth = this.containerWidth - this.grid.scrollBarSize,
            currentWidth = 0,
            unassignedCount = 0,
            unassignedWidth,
            remainWidth,
            diff;

        if (!columnWidthList.length) {
            ne.util.forEachArray(columnModelList, function(columnModel) {
                var width = ne.util.isUndefined(columnModel['width']) ? -1 : Math.max(minimumColumnWidth, columnModel['width']);
                //% 경우 처리
                if (ne.util.isString(width) && width.indexOf('%')) {
                    width = width.replace('%', '');
                    width = Math.floor(frameWidth * (width / 100));
                }

                columnWidthList.push(width);
            }, this);
        }

        ne.util.forEachArray(columnWidthList, function(width) {
            if (width > 0) {
                width = Math.max(minimumColumnWidth, width);
                currentWidth += width + border;
            } else {
                unassignedCount++;
            }
        }, this);
        currentWidth += border;

        remainWidth = frameWidth - currentWidth;
        unassignedWidth = Math.max(minimumColumnWidth, Math.floor(remainWidth / unassignedCount) - border);

        //할당되지 않은 column 할당함
        ne.util.forEachArray(columnWidthList, function(width, index) {
            if (width === -1) {
                columnWidthList[index] = unassignedWidth;
                currentWidth += unassignedWidth + border;
            }
        });

        remainWidth = frameWidth - currentWidth;

        if (remainWidth < 0) {
            frameWidth += Math.abs(remainWidth);
        }
        this.set({
            width: frameWidth,
            columnWidthList: columnWidthList
        });
    },

    /**
     * 인자로 넘어온 list 데이터가 화면에 출력되었을 때 높이를 계산한다.
     * @param {Array} list  인자로 넘어온 list 데이터
     * @return {number} 계산된 높이값
     * @private
     */
    _getDataHeight: function(list) {
        var border = this.grid.option('border');
        return Util.getHeight(list.length, this.rowHeight, border);
    },

    /**
     * 옵션값에 scroll fix 가 설정되어 있다면, scroll fix 한다.
     * @param {Array} list  scrollFix 를 위한 높이 계산 시 사용될 prepend 된 data의 list
     * @private
     */
    _doFreeze: function(list) {
        if (this.freeze || (this.grid.option('freeze') && this.scrollTop !== 0)) {
            var dataHeight = this._getDataHeight(list);
            this.set('maxScrollTop', this.getMaxScrollTop());
            this.set('scrollTop', this.scrollTop + dataHeight);
        }
    },

    /**
     * 렌더링 데이터를 반환한다.
     * @return {{top: number, startIdx: *, endIdx: *}}
     * @private
     */
    _getRenderingData: function() {
        var top,
            border = this.grid.option('border'),
            scrollTop = this.scrollTop,
            rowHeight = this.rowHeight,
            displayCount = this.grid.option('displayCount'),
            startIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + border)) - this.hiddenLineCount),
            endIdx = Math.min(this.collection.length,
                Math.floor(startIdx + this.hiddenLineCount + displayCount + this.hiddenLineCount));

        top = (startIdx === 0) ? 0 : Util.getHeight(startIdx, rowHeight, border) - border;

        return {
            top: top,
            startIdx: startIdx,
            endIdx: endIdx
        };
    },

    /**
     * grid 되었을 시 숨겨진 행의 개수가 critical point 보다 적게 남아있는지를 확인하여 rendering 할지 여부를 결정한다.
     * @return {boolean}    랜더링 여부
     * @private
     */
    _isRenderable: function() {
         var border = this.grid.option('border'),
             scrollTop = this.scrollTop,
             rowHeight = this.rowHeight,
             height = this.height,
             displayCount = this.grid.option('displayCount'),
             rowCount = this.collection.length,
             displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + border))),
             displayEndIdx = Math.min(rowCount - 1, Math.floor((scrollTop + height) / (rowHeight + border))),
             startIdx = Math.max(0, this.startIdx),
             endIdx = Math.min(rowCount, this.endIdx);

        //시작 지점이 임계점 이하로 올라갈 경우 return true
        if (startIdx !== 0) {
            if (startIdx + this.criticalPoint > displayStartIdx) {
                return true;
            }
        }

        //마지막 지점이 임계점 이하로 내려갔을 경우 return true
       if (endIdx !== rowCount) {
            if (endIdx - this.criticalPoint < displayEndIdx) {
                return true;
            }
        }
        return false;
    }
});

/**
 * @fileoverview Body View
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Body View
 * @constructor Body
 */
var Body = ne.util.defineClass(Base.View, /**@lends Body.prototype */{
    eventHandler: {
        'mousedown': '_onMouseDown',
        'click': '_onClick'
    },
    padding: 10,
    className: 'infinite_body',
    style: 'position: absolute; top: 0; white-space: nowrap;',
    _template: {
        table: '<table width="100%" border="0" cellpadding="0" ' +
            'cellspacing="' +
            '<%=border%>' +
            '" ' +
            'bgcolor="' +
            '<%=color%>' +
            '" ' +
            'class="' +
            '<%=className%>' +
            '" ' +
            'style="' +
            'table-layout:fixed' +
            '"' +
            '>' +
            '<colgroup>' +
            '<%=col%>' +
            '</colgroup>' +
            '<tbody>' +
            '<%=tbody%>' +
            '</tbody>',
        tr: '<tr ' +
            'key="' +
            '<%=key%>' +
            '" ' +
            'style="' +
            'height:<%=height%>px;' +
            'background:<%=color%>;' +
            '" ' +
            'class="' +
            '<%=className%>' +
            '" ' +
            '>' +
            '<%=content%>' +
            '</tr>',
        td: '<td ' +
            'columnname="<%=columnName%>" ' +
            'style="' +
            'text-align:<%=align%>;' +
            'overflow:hidden;padding:0 <%=padding%>px;*padding:0 ' +
            '<%=padding%>px;border:0;white-space:nowrap;*white-space:pre;' +
            '" ' +
            'class="' +
            '<%=className%>' +
            '" ' +
            '<%=attributes%>' +
            '>' +
            '<%=content%>' +
            '</td>'
    },

    /**
     * 생성자 함수
     * @param {object} attributes
     * @param   {object} attributes.selection 셀렉션 view 인스턴스
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);

        if (this.grid.option('useSelection')) {
            this.setOwnProperties({
                selection: attributes.selection
            });
        }

        this.setOwnProperties({
            resizeHandler: null,
            isIe7: !!(ne.util.browser.msie && ne.util.browser.version === 7)
        });

        this.grid.focusModel.on('select', this.select, this);
        this.grid.focusModel.on('unselect', this.unselect, this);

        this.model.on({
            'change': this._onModelChange,
            'refresh': this._onRefresh
        }, this);

        this.grid.view.container.on({
            'scroll': this._onScroll
        }, this);
    },

    /**
     * 디자인 클래스를 unselect 한다.
     * @param {(Number|String)} key select 된 해당 row 의 key
     * @param {Object} [selectMap] focusModel 에서 이벤트 발생시 전달되는 selectMap 오브젝트
     */
    select: function(key, selectMap) {
        var $tr = this.$el.find('tr[key="' + key + '"]');

        $tr.length && $tr.css('background', '').addClass('selected');
    },

    /**
     * 디자인 클래스 unselect 한다.
     * @param {(Number|String)} key unselect 된 해당 row 의 key
     * @param {Object} [selectMap] focusModel 에서 이벤트 발생시 전달되는 selectMap 오브젝트
     */
    unselect: function(key, selectMap) {
        var $tr = this.$el.find('tr[key="' + key + '"]'),
            color = this.grid.option('color');
        $tr.length && $tr.removeClass('selected').css('background', color['td']);
    },

    /**
     * 스크롤 이벤트 핸들러
     * @private
     */
    _onScroll: function() {
        if (this.selection) {
            this.selection.draw();
        }
    },

    /**
     * click 이벤트 핸들러
     * @param {event} clickEvent 클릭이벤트
     * @private
     */
    _onClick: function(clickEvent) {
        var $target = $(clickEvent.target),
            columnName = $target.closest('td').attr('columnname'),
            rowKey = $target.closest('tr').attr('key'),
            customEvent = {
                $target: $target,
                rowKey: rowKey,
                columnName: columnName
            };

        this.fire('click', customEvent);
    },

    /**
     * mouseDown 이벤트 핸들러
     * @param {event} mouseDownEvent 마우스다운 이벤트
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        var $target = $(mouseDownEvent.target),
            rowKey = $target.closest('tr').attr('key'),
            selection = this.selection;

        this.grid.focusModel.select(rowKey);
        if (selection) {
            selection.attachMouseEvent(mouseDownEvent);
            if (mouseDownEvent.shiftKey) {
                if (!selection.hasSelection()) {
                    selection.startSelection();
                }
                selection.updateSelection();
            } else {
                selection.stopSelection();
            }
        }
    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     *
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'top') {
            this.$el.css('top', value + 'px');
        } else if (key === 'width') {
            this._setContainerWidth(value);
        } else if (key === 'columnWidthList') {
            this._changeColumnWidth(value);
        }
    },

    /**
     * Model Change 이벤트 핸들러로부터 columnWidthList 를 전달받아, 현재 table의
     * 각 열의 높이를 조정한다.
     * @param {Array} columnWidthList 컬럼 너비 리스트
     * @private
     */
    _changeColumnWidth: function(columnWidthList) {
        var $colList = this.$el.find('colgroup').find('col');

        ne.util.forEachArray(columnWidthList, function(width, index) {
            if (this.isIe7) {
                width -= this.padding * 2;
            }
            $colList.eq(index).css('width', width + 'px');
        }, this);
    },

    /**
     * model 의 refresh 이벤트가 발생했을 때 이벤트 핸들러
     * @private
     */
    _onRefresh: function() {
        this.render();
    },

    /**
     * <colgroup> 내 들어갈 마크업 문자열을 생성한다.
     * @param {Array} columnWidthList   컬럼 너비 정보 리스트
     * @return {string} 마크업 문자열
     * @private
     */
    _getColGroupMarkup: function(columnWidthList) {
        var col = '';

        ne.util.forEachArray(columnWidthList, function(width) {
            if (this.isIe7) {
                width -= this.padding * 2;
            }
            col += '<col style="width:' + width + 'px"></col>';
        }, this);
        return col;
    },

    /**
     * <tbody> 내 들어갈 마크업 문자열을 생성한다.
     * @return {string} 생성된 마크업 문자열
     * @private
     */
    _getTbodyMarkup: function() {
        var list = this.model.list,
            columnModelList = this.grid.option('columnModelList'),
            color = this.grid.option('color'),
            trList = [],
            className = this.grid.option('className');

        //각 tr의 마크업을 생성한다.
        ne.util.forEachArray(list, function(item) {
            var tdList = [],
                height = this.model.rowHeight,
                colSpanBy = item.data['_colSpanBy'],
                length = columnModelList.length,
                attributes = ne.util.isExisty(colSpanBy) ? 'colspan="' + length + '"' : '';
            //각 TD의 마크업을 생성한다.
            ne.util.forEachArray(columnModelList, function(columnModel) {
                var td,
                    columnName = columnModel['columnName'],
                    content;
                //Colspan 이 있으면 해당하는 TD의 마크업만 생성하고, 없다면 전체 TD 마크업을 생성한다.
                if (!ne.util.isExisty(colSpanBy) || colSpanBy === columnName) {
                    if (ne.util.isFunction(columnModel.formatter)) {
                        content = columnModel.formatter(item.data[columnName], item.data);
                    } else {
                        content = item.data[columnName];
                    }
                    td = Util.template(this._template.td, {
                        className: className.td,
                        columnName: columnName,
                        align: columnModel['align'],
                        padding: this.padding,
                        content: content,
                        attributes: attributes
                    });
                    tdList.push(td);
                }
            }, this);

            trList.push(Util.template(this._template.tr, {
                className: className.tr,
                color: color['td'],
                height: height,
                key: item.id,
                content: tdList.join('')
            }));
        }, this);
        return trList.join('');
    },

    /**
     * 랜더링 한다.
     * @return {Body}
     */
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        var columnWidthList = this.model.columnWidthList,
            color = this.grid.option('color'),
            border = this.grid.option('border'),
            selectList = this.grid.focusModel.getSelectList(),
            className = this.grid.option('className');

        this.$el.empty().prepend(Util.template(this._template.table, {
            className: className.table,
            border: border,
            color: border ? color['border'] : '',
            col: this._getColGroupMarkup(columnWidthList),
            tbody: this._getTbodyMarkup()
        }));

        this._setContainerWidth(Math.ceil(this.model.width));
        ne.util.forEachArray(selectList, function(key) {
            this.select(key);
        }, this);

        if (this.selection) {
            this.selection.draw();
        }

        //resize 를 사용한다면 resize handler 를 추가한다.
        if (this.grid.option('useColumnResize')) {
            this.resizeHandler = this.createView(ResizeHandlerContainer, {
                grid: this.grid,
                model: this.model,
                height: this.$el.height()
            });
            this.$el.append(this.resizeHandler.render().el);
        }

        this._attachHandler();

        return this;
    },

    /**
     * Container 의 width 를 설정한다.
     * @param {Number} width 너비값
     * @private
     */
    _setContainerWidth: function(width) {
        if (width === 0) {
            width = '100%';
        } else {
            width = width + 'px';
        }
        this.$el.css('width', width);
    }
});

/**
 * @fileoverview Container 뷰
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Container View
 * @constructor Container
 */
var Container = ne.util.defineClass(Base.View, /**@lends Container.prototype */{
    className: 'infinite_container',
    eventHandler: {
        'scroll': '_onScroll'
    },
    style: 'position: relative;',
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);

        this.model.on({
            'change': this._onModelChange
        }, this);
        this._initializeCss();
    },

    /**
     * option 값에 맞춰 css 스타일을 지정한다.
     * @private
     */
    _initializeCss: function() {
        var color = this.grid.option('color')['border'],
            border = this.grid.option('border');

        this.$el.css({
            'overflow-x': this.grid.option('scrollX') ? 'scroll' : 'hidden',
            'overflow-y': this.grid.option('scrollY') ? 'scroll' : 'hidden',
            'height': this.grid.option('scrollX') ? this.model.height + this.grid.scrollBarSize : this.model.height
        });
        if (border === 0) {
            this.$el.css('border', 'solid 1px ' + color);
        }

    },

    /**
     * scroll event handler
     *  - scroll top 과 scroll left 를 동기화 한다.
     * @param {event} scrollEvent 스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        var difference = Math.abs(this.model.scrollTop - scrollEvent.target.scrollTop);
        //FF 에서의 스크롤 문제 해결
        if (difference < 10 && difference > 0) {
            if (this.model.scrollTop > scrollEvent.target.scrollTop) {
                scrollEvent.target.scrollTop -= 80;
            } else {
                scrollEvent.target.scrollTop += 80;
            }
        }
        this.model.set({
            'scrollTop': scrollEvent.target.scrollTop,
            'scrollLeft': scrollEvent.target.scrollLeft
        });
        this.invoke('scroll', scrollEvent);

    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     *
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'scrollTop') {
            this.el.scrollTop = value;
        } else if (key === 'scrollLeft') {
            this.el.scrollLeft = value;
            if (this.el.scrollLeft !== value) {
                this.model.set('scrollLeft', this.el.scrollLeft);
            }
        }
    },

    /**
     * 랜더링 한다.
     * @return {Container}
     */
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        this.selection = this.createView(Selection, {
            grid: this.grid,
            model: this.model
        });

        this.body = this.createView(Body, {
            grid: this.grid,
            selection: this.selection,
            model: this.model
        });

        this.$el.empty()
            .append(this.body.render().el)
            .append(this.selection.render().el);

        this._attachHandler();
        return this;
    }
});

/**
 * @fileoverview Header View
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Header View
 * @constructor Header
 */
var Header = ne.util.defineClass(Base.View, /**@lends Header.prototype */{
    className: 'infinite_header_container',
    style: 'overflow:hidden;position: relative;',
    /**
     * 생성자
     * @param {Object} attributes
     */
    init: function (attributes){
        Base.View.prototype.init.apply(this, arguments);
        this.model.on('change', this._onModelChange, this);
        this.setOwnProperties({
            resizeHandler: null
        });
    },
    _template: {
        table: '' +
        '<div class="infinite_header">' +
        '<table width="100%" border="0" cellpadding="0" cellspacing="' +
        '<%=border%>' +
        '" ' +
        'style="' +
        'table-layout:fixed;' +
        '"' +
        '>' +
        '<colgroup>' +
        '<%=col%>' +
        '</colgroup>' +
        '<tbody>' +
        '<%=tbody%>' +
        '</tbody>' +
        '</div>'
    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     *
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'width') {
            this._setContainerWidth(value);
        } else if (key === 'scrollLeft') {
            this.$el[0].scrollLeft = value;
        } else if (key === 'columnWidthList') {
            this._changeColumnWidth(value);
        }
    },

    /**
     * Model Change 이벤트 핸들러로부터 columnWidthList 를 전달받아, 현재 table의
     * 각 열의 너비를 조정한다.
     * @param {Array} columnWidthList 컬럼 너비 리스트
     * @private
     */
    _changeColumnWidth: function(columnWidthList) {
        var $colList = this.$el.find('colgroup').find('col');

        ne.util.forEachArray(columnWidthList, function(width, index) {
            $colList.eq(index).width(width);
        }, this);
    },

    /**
     * 랜더링 한다.
     * @return {Header}
     */
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        var columnModelList = this.grid.option('columnModelList'),
            border = this.grid.option('border'),
            tbody = '',
            html,
            height = this.model.headerHeight,
            col = '',
            color = this.grid.option('color'),
            resizeHandler;

        ne.util.forEachArray(columnModelList, function() {
            col += '<col></col>';
        }, this);

        tbody += '<tr style="height:' + height + 'px">';
        ne.util.forEachArray(columnModelList, function(columnModel) {
            tbody += '<th columnname="' + columnModel['columnName'] + '" style="' +
            'overflow:hidden;white-space:nowrap;*white-space:pre;text-align:center;padding:0;border:0;' +
            '">' + columnModel['title'] + '</th>';
        });
        tbody += '</tr>';

        html = Util.template(this._template.table, {
            border: border,
            col: col,
            tbody: tbody
        });

        this.$el.html(html);
        this._setContainerWidth(this.model.width);
        this.$el.find('table').css('background', color['border']);
        this.$el.find('th').css('background', color['th']);

        if (border === 0) {
            this.$el.css('border', 'solid 1px ' + color['border']);
            this.$el.css('border-bottom', '0px');
        }
        //resize 를 사용한다면 resize handler 를 추가한다.
        if (this.grid.option('useColumnResize')) {
            this.resizeHandler = this.createView(ResizeHandlerContainer, {
                grid: this.grid,
                model: this.model,
                height: height
            });
            this.$el.append(this.resizeHandler.render().el);
        }
        if (!this.grid.option('hasHeader')) {
            this.$el.css({
                height: '0px',
                width: '0px',
                border: 0
            });
        }
        this._attachHandler();
        return this;
    },

    /**
     * Model 의 변경된 width 값을 받아 container 의 width 를 결정한다.
     * @param {(Number|String)} width 너비값
     * @private
     */
    _setContainerWidth: function(width) {
        //spacer 만큼 너비를 계산하여 padding 을 설정한다.
        var padding = this.grid.option('border') * 6 + this.grid.scrollBarSize;

        if (width === 0) {
            width = '100%';
        } else {
            width = width + 'px';
        }
        this.$el.find('.infinite_header:first').css({
            'width': width,
            'paddingRight': padding + 'px'
        });
    }
});

/**
 * @fileoverview Key 입력을 담당하는 파일
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Keyboard
 * @constructor Keyboard
 */
var Keyboard = ne.util.defineClass(Base.View, /**@lends Keyboard.prototype */{
    keyMap: {
        'PAGE_UP': 33,
        'PAGE_DOWN': 34,
        'LEFT_ARROW': 37,
        'UP_ARROW': 38,
        'RIGHT_ARROW': 39,
        'DOWN_ARROW': 40,
        'HOME': 36,
        'END': 35,
        'CHAR_A': 65,
        'CHAR_C': 67,
        'CTRL': 17,
        'META': 91,
        'SHIFT': 16
    },
    eventHandler: {
        'keydown': '_onKeyDown',
        'keyup': '_onKeyUp',
        'blur': '_onBlur',
        'focus': '_onFocus'
    },
    tagName: 'textarea',
    style: 'position: absolute; width: 0; height: 0; top:0; left: -9999px;',
    /**
     * 생성자
     * @param {Object} attributes
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
    },

    /**
     * focus event handler
     * @param {event} focusEvent focus 이벤트
     * @private
     */
    _onFocus: function(focusEvent) {
        this.grid.getSelectionInstance().show();
    },

    /**
     * blur event handler
     * @param {event} blurEvent blur 이벤트
     * @private
     */
    _onBlur: function(blurEvent) {
        this.model.collection.unlock();
        this.grid.blur();
    },

    /**
     * keyUp event handler
     * @param {event} keyUpEvent keyup 이벤트
     * @private
     */
    _onKeyUp: function(keyUpEvent) {
        this.model.collection.unlock();
    },

    /**
     * keyDown 시 이벤트 핸들러
     * @param {event} keyDownEvent keydown 이벤트
     * @private
     */
    _onKeyDown: function(keyDownEvent) {
        var scrollTop,
            keyIdentified = true,
            keyCode = keyDownEvent.which ? keyDownEvent.which : keyDownEvent.keyCode;
        this.model.collection.lock();
        switch (keyCode) {
            case this.keyMap.SHIFT:
                break;
            case this.keyMap.CTRL:
                break;
            case this.keyMap.META:
                break;
            case this.keyMap.UP_ARROW:
                this.scrollVertical(-this.grid.scrollingScale);
                break;
            case this.keyMap.DOWN_ARROW:
                this.scrollVertical(this.grid.scrollingScale);
                break;
            case this.keyMap.LEFT_ARROW:
                this.scrollHorizontal(-this.grid.scrollingScale);
                break;
            case this.keyMap.RIGHT_ARROW:
                this.scrollHorizontal(this.grid.scrollingScale);
                break;
            case this.keyMap.PAGE_UP:
                this.scrollVertical(-this.grid.scrollingScalePerPage, true);
                break;
            case this.keyMap.PAGE_DOWN:
                this.scrollVertical(this.grid.scrollingScalePerPage, true);
                break;
            case this.keyMap.HOME:
                this.model.set('scrollTop', 0);
                break;
            case this.keyMap.END:
                this.model.set('scrollTop', this.model.maxScrollTop);
                break;
            case this.keyMap.CHAR_A:
                if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
                    keyDownEvent.preventDefault();
                    this.grid.getSelectionInstance().selectAll();
                }
                break;
            case this.keyMap.CHAR_C:
                if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
                    this._keyDownForCopy();
                }
                break;
            default :
                keyIdentified = false;
                break;
        }
        if (keyIdentified && !this.grid.option('keyEventBubble')) {
            keyDownEvent.stopPropagation();
        }
    },

    /**
     * copy를 위한 keydown event 가 발생했을 경우 데이터를 clipboard 에 설정한다.
     * @private
     */
    _keyDownForCopy: function() {
        /* istanbul ignore next: select, focus 검증할 수 없음 */
        var text = this.grid.getSelectionInstance().getSelectionData().join('\n');
        if (window.clipboardData) {
            if (window.clipboardData.setData('Text', text)) {
                this.$el.select();
            } else {
                this.$el.val('').select();
            }
        } else {
            this.$el.val(text).select();
        }
    },

    /**
     * 세로 스크롤 한다.
     * @param {number} pixel    이동할 픽셀값
     * @param {boolean} [isPercentage=false] 퍼센티지로 계산할지 여부
     */
    scrollVertical: function(pixel, isPercentage) {
        pixel = isPercentage ? Math.floor(this.model.height * (pixel / 100)) : pixel;
        var scrollTop = Math.max(0, this.model.scrollTop + pixel);
        this.model.set('scrollTop', scrollTop);
    },

    /**
     * 가로 스크롤 한다.
     * @param {number} pixel 이동할 픽셀값
     */
    scrollHorizontal: function(pixel) {
        var scrollLeft = Math.max(0, this.model.scrollLeft + pixel);
        this.model.set('scrollLeft', scrollLeft);
    },

    /**
     * 랜더링 한다.
     * @return {Keyboard}
     */
    render: function() {
        this._detachHandler();
        this._attachHandler();
        return this;
    }
});

/**
 * @fileoverview 리사이즈 핸들러
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * ResizeHandlerContainer
 * @constructor ResizeHandlerContainer
 */
var ResizeHandlerContainer = ne.util.defineClass(Base.View, /**@lends ResizeHandlerContainer.prototype */{
    className: 'infinite_resize_handler_container',
    eventHandler: {
        'mousedown .infinite_resize_handler' : '_onMouseDown'
    },
    style: 'position:relative;width:0px;',

    /**
     * 생성자
     * @param {Object} attributes
     *      @param {number} attributes.height  핸들러의 높이값.
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.setOwnProperties({
            height: attributes.height,
            isResizing: false,     //현재 resize 발생 상황인지
            $target: null,         //이벤트가 발생한 target resize handler
            differenceLeft: 0,
            initialWidth: 0,
            initialOffsetLeft: 0,
            initialLeft: 0,
            useSelectionStatus: null
        });
        this.height = attributes.height;
        this.model.on('change', this._onModelChange, this);
    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key;

        if (key === 'columnWidthList') {
            this._refreshHandlerPosition();
        }
    },

    /**
     * 렌더링 한다.
     * @return {ResizeHandlerContainer}
     */
    render: function() {
        var columnModelList = this.grid.option('columnModelList'),
            length = columnModelList.length,
            handler;

        this._detachHandler();
        this.destroyChildren();
        this.$el.empty();

        ne.util.forEachArray(columnModelList, function(columnModel, index) {
            handler = this.createView(ResizeHandler, {
                grid: this.grid,
                index: index,
                columnName: columnModel.columnName,
                isLast: index === length - 1
            });
            this.$el.append(handler.render().el);
        }, this);
        this.$el.css({
            height: this.height + 'px',
            marginTop: -this.height + 'px'
        });
        this._attachHandler();
        this._refreshHandlerPosition();
        return this;
    },

    /**
     * 생성된 핸들러의 위치를 갱신한다.
     * @private
     */
    _refreshHandlerPosition: function() {
        var columnWidthList = this.model.columnWidthList,
            $resizeHandleList = this.$el.find('.infinite_resize_handler'),
            border = this.grid.option('border'),
            $colList = this.grid.view.header.$el.find('th'),
            curPos = 0,
            width,
            $handler;

        ne.util.forEachArray($resizeHandleList, function(item, index) {
            width = $colList.eq(index).width() || columnWidthList[index];
            $handler = $resizeHandleList.eq(index);

            curPos += width + border;
            //핸들러를 가운데 위치 시키기 위해 핸들러 너비 절반의 올림값(4)만큼 좌로 이동한다.
            $handler.css('left', (curPos - 4) + 'px');
        }, this);
    },

    /**
     * mousedown 이벤트 핸들러
     * @param {event} mouseDownEvent    마우스 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        this.useSelectionStatus = this.grid.option('useSelection');
        this.grid.option('useSelection', false);
        this._startResizing(mouseDownEvent);
    },

    /**
     * mouseup 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        this.grid.option('useSelection', this.useSelectionStatus);
        this._stopResizing();
    },

    /**
     * mousemove 이벤트 핸들러
     * @param {event} mouseMoveEvent    마우스 이벤트 객체
     * @private
     */
    _onMouseMove: function(mouseMoveEvent) {
        /* istanbul ignore else */
        if (this._isResizing()) {
            mouseMoveEvent.preventDefault();

            var left = mouseMoveEvent.pageX - this.initialOffsetLeft,
                width = this._calculateWidth(mouseMoveEvent.pageX),
                index = parseInt(this.$target.attr('columnindex'), 10);

            this.$target.css('left', left + 'px');
            this.model.setColumnWidth(index, width);
        }
    },

    /**
     * 너비를 계산한다.
     * @param {number} pageX    마우스의 x 좌표
     * @return {number} x좌표를 기준으로 계산한 width 값
     * @private
     */
    _calculateWidth: function(pageX) {
        var difference = pageX - this.initialOffsetLeft - this.initialLeft;
        return this.initialWidth + difference;
    },

    /**
     * 현재 mouse move resizing 중인지 상태 flag 반환
     * @return {boolean}    현재 resize 중인지 여부
     * @private
     */
    _isResizing: function() {
        return !!this.isResizing;
    },

    /**
     * resize start 세팅
     * @param {event} mouseDownEvent 마우스 이벤트
     * @private
     */
    _startResizing: function(mouseDownEvent) {
        var columnWidthList = this.model.columnWidthList,
            $target = $(mouseDownEvent.target);

        this.isResizing = true;
        this.$target = $target;
        this.initialLeft = parseInt($target.css('left').replace('px', ''), 10);
        this.initialOffsetLeft = this.$el.offset().left;
        this.initialWidth = columnWidthList[$target.attr('columnindex')];
        $('body')
            .bind('mousemove', $.proxy(this._onMouseMove, this))
            .bind('mouseup', $.proxy(this._onMouseUp, this))
            .css('cursor', 'col-resize');
    },

    /**
     * resize stop 세팅
     * @private
     */
    _stopResizing: function() {
        this.isResizing = false;
        this.$target = null;
        this.initialLeft = 0;
        this.initialOffsetLeft = 0;
        this.initialWidth = 0;
        $('body')
            .unbind('mousemove', $.proxy(this._onMouseMove, this))
            .unbind('mouseup', $.proxy(this._onMouseUp, this))
            .css('cursor', 'default');
    }
});

/**
 * ResizeHandler
 * @constructor ResizeHandler
 */
var ResizeHandler = ne.util.defineClass(Base.View, /**@lends ResizeHandler.prototype */{
    className: 'infinite_resize_handler',
    style: 'float:left; position:absolute; height:100%; opacity:0; filter:alpha(opacity=0); cursor:col-resize;',
    handlerWidth: 7,
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.setOwnProperties({
            columnName: attributes.columnName,
            index: attributes.index,
            isLast: attributes.isLast
        });
    },

    /**
     * 랜더링한다
     * @returns {ResizeHandler}
     */
    render: function() {
        var color = this.grid.option('color').border;
        this._detachHandler();
        this.destroyChildren();
        this.$el.empty();
        this.$el.attr({
            'columnindex': this.index,
            'columnname': this.columnName,
            'title': '마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있습니다.'
        }).css({
            'background': color
        });
        if (this.isLast) {
            //마지막 핸들러는 절반 이하의 크기를 가져야 하기 때문에 핸들러 크기의 절반값의 내림값을 설정한다.
            this.$el.width(Math.floor(this.handlerWidth / 2));
        } else {
            this.$el.width(this.handlerWidth);
        }
        this._attachHandler();
        return this;
    }
});

/**
 * @fileoverview Selection 영역을 담당
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Selection view Class
 * @constructor Selection
 */
var Selection = ne.util.defineClass(Base.View, /**@lends Selection.prototype */{
    eventHandler: {
        'mousedown': '_onMouseDown'
    },
    className: 'infinite_selection_layer',
    style: 'display:none;position:absolute;top:0;left:1px;width:0;height:0;border:dotted 1px red;' +
    'background:orange;opacity:0.2;filter:alpha(opacity=10)',
    /**
     * 생성자
     * @param {Object} attributes
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.grid.view.keyboard.on({
            'blur': this.stopSelection
        }, this);
        this.model.on({
            'change': this._onModelChange
        }, this);
        this.setOwnProperties({
            rangeKey: [-1, -1],
            isShown: false
        });
        this.setOwnProperties({
            selectionHandler: {
                'mousemove': $.proxy(this._onMouseMove, this),
                'mouseup': $.proxy(this._onMouseUp, this),
                'selectstart': $.proxy(this._onSelectStart, this)
            },
            timeoutForUpdateSelection: 0,
            startPageX: 0,
            startPageY: 0,
            mousePos: {
                pageX: 0,
                pageY: 0
            }
        });
    },

    /**
     * 마우스 이벤트 핸들러를 attach 한다.
     * @param {event} mouseEvent    마우스 이벤트 핸들러
     */
    attachMouseEvent: function(mouseEvent) {
        if (this.grid.option('useSelection')) {
            this.setOwnProperties({
                startPageX: mouseEvent.pageX,
                startPageY: mouseEvent.pageY
            });
            this._setMousePos(mouseEvent);
            $(document).on('mousemove', this.selectionHandler.mousemove);
            $(document).on('mouseup', this.selectionHandler.mouseup);
            $(document).on('selectstart', this.selectionHandler.selectstart);
        }
    },

    /**
     * 마우스 이벤트 핸들러를 detach 한다.
     */
    detachMouseEvent: function() {
        $(document).off('mousemove', this.selectionHandler.mousemove);
        $(document).off('mouseup', this.selectionHandler.mouseup);
        $(document).off('selectstart', this.selectionHandler.selectstart);
    },

    /**
     * Mouse down 이벤트 핸들러
     * @param {event} mouseDownEvent    마우스 이벤트 핸들러
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        var pageX = mouseDownEvent.pageX,
            pageY = mouseDownEvent.pageY,
            key = this.getKey(pageX, pageY);

        this.attachMouseEvent(mouseDownEvent);
        this.grid.focusModel.select(key);
        if (mouseDownEvent.shiftKey) {
            if (!this.hasSelection()) {
                this.startSelection(key);
            }
            this.updateSelection(key);
        } else {
            this.stopSelection();
        }
    },

    /**
     * Mouse move 이벤트 핸들러
     * @param {event} mouseMoveEvent    마우스 이벤트 핸들러
     * @private
     */
    _onMouseMove: function(mouseMoveEvent) {
        this._setMousePos(mouseMoveEvent);
        if (this.hasSelection()) {
            clearTimeout(this.timeoutForUpdateSelection);
            this.timeoutForUpdateSelection = setTimeout($.proxy(this._scrollOnSelection, this), 0);
            this.updateSelection();
        } else if (this._getDistance(mouseMoveEvent) > 10) {
            this.startSelection(this.getKey(this.startPageX, this.startPageY));
        }
    },

    /**
     * MouseUp 이벤트 핸들러
     * @param {event} mouseUpEvent  마우스 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        this.detachMouseEvent();
    },

    /**
     * selection start 시 영역 선택하지 않도록 prevent default
     * @param {event} selectStartEvent  이벤트 핸들러
     * @return {boolean}
     * @private
     */
    _onSelectStart: function(selectStartEvent) {
        /* istanbul ignore next: selectStartEvent 확인 불가 */
        selectStartEvent.preventDefault();
        return false;
    },

    /**
     * selection 시 mouse pointer 가 영역을 벗어났을 시 자동 scroll 한다.
     * @private
     */
    _scrollOnSelection: function() {
        if (this.hasSelection()) {
            var status = this.overflowStatus(this.mousePos.pageX, this.mousePos.pageY);
            if (status.y > 0) {
                this.model.set('scrollTop', this.model.scrollTop + this.grid.scrollingScale);
            } else if (status.y < 0) {
                this.model.set('scrollTop', this.model.scrollTop - this.grid.scrollingScale);
            }
            if (status.x > 0) {
                this.model.set('scrollLeft', this.model.scrollLeft + this.grid.scrollingScale);
            } else if (status.x < 0) {
                this.model.set('scrollLeft', this.model.scrollLeft - this.grid.scrollingScale);
            }
        }
    },

    /**
     * mousedown 이 처음 일어난 지점부터의 거리를 구한다.
     * @param {event} mouseMoveEvent    마우스 이벤트
     * @return {number} 피타고라스 정리를 이용한 거리.
     * @private
     */
    _getDistance: function(mouseMoveEvent) {
        var pageX = mouseMoveEvent.pageX,
            pageY = mouseMoveEvent.pageY,
            x = Math.abs(this.startPageX - pageX),
            y = Math.abs(this.startPageY - pageY);
        return Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    },

    /**
     * 내부 변수로 mouse position 을 저장한다.
     * @param {event} mouseEvent    마우스 이벤트
     * @private
     */
    _setMousePos: function(mouseEvent) {
        this.mousePos.pageX = mouseEvent.pageX;
        this.mousePos.pageY = mouseEvent.pageY;
    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     *
     * @param {{key:number, value: value}} changeEvent  Change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'headerHeight' || key === 'top') {
            this.draw();
        } else if (key === 'width') {
            this.$el.width(value - 3);
        }
    },

    /**
     * selection range 를 반환한다.
     * @return {Array}  범위의 키값. [startKey, endKey]
     */
    getSelectionRange: function() {
        return this.rangeKey;
    },

    /**
     * selection 된 시작과 끝 영역의 index 를 리턴한다.
     * @return {Array} 범위의 인덱스값. [startIndex, endIndex]
     */
    getSelectionRangeIndex: function() {
        var collection = this.model.collection,
            range = [
               collection.indexOf(collection.get(this.rangeKey[0])),
               collection.indexOf(collection.get(this.rangeKey[1]))
            ],
            startIdx = Math.min.apply(Math, range),
            endIdx = Math.max.apply(Math, range);
        return [startIdx, endIdx];
    },

    /**
     * selection 데이터가 존재하는지 확인한다.
     * @return {boolean}
     */
    hasSelection: function() {
        return !(this.rangeKey[0] === -1);
    },

    /**
     * selection 된 영역의 length 를 반환한다.
     * @return {number}
     */
    getSelectionLength: function() {
        var range = this.getSelectionRangeIndex();
        return (range[1] + 1) - range[0];
    },

    /**
     * selection 을 시작한다.
     * @param {number} [key]    시작할 row 의 key
     */
    startSelection: function(key) {
        if (this.grid.option('useSelection')) {
            key = ne.util.isUndefined(key) ? this.getKey(this.mousePos.pageX, this.mousePos.pageY) : key;
            if (key !== -1) {
                this.rangeKey[0] = key;
                this.updateSelection(key);
            }
        }
    },

    /**
     * selection 영역을 update 한다.
     * @param {number} [key] 업데이트 된 row 의 key
     */
    updateSelection: function(key) {
        if (this.grid.option('useSelection')) {
            key = ne.util.isUndefined(key) ? this.getKey(this.mousePos.pageX, this.mousePos.pageY) : key;
            if (key !== -1) {
                this.rangeKey[1] = key;
                this.show();
            }
        }
    },

    /**
     * selection data 를 배열 형태로 가져온다.
     * @return {Array}
     */
    getSelectionData: function() {
        var range = this.getSelectionRangeIndex(),
            collectionList = this.model.collection.list.slice(range[0], range[1] + 1),
            columnModelList = this.grid.option('columnModelList'),
            rowStringList = [];

        ne.util.forEachArray(collectionList, function(collection) {
            var columnStringList = [];
            ne.util.forEachArray(columnModelList, function(columnModel) {
                var columnName = columnModel['columnName'],
                    data = collection.data,
                    value;
                if (ne.util.isFunction(columnModel.formatter)) {
                    value = columnModel.formatter(data[columnName], data);
                } else {
                    value = data[columnName];
                }
                columnStringList.push(Util.stripTags(value));
            });
            rowStringList.push(columnStringList.join('\t'));
        });
        return rowStringList;
    },

    /**
     * 전체 selection 한다.
     */
    selectAll: function() {
        var collection = this.model.collection;
        this.rangeKey = [collection.at(0).id, collection.at(collection.length - 1).id];
        this.draw();
    },

    /**
     * selection 을 중지한다.
     */
    stopSelection: function() {
        this.rangeKey = [-1, -1];
        this.draw();
    },

    /**
     * selection 영역을 보인다.
     */
    show: function() {
        this.isShown = true;
        this.draw();
    },

    /**
     * selection 영역을 감춘다.
     */
    hide: function() {
        this.isShown = false;
        this.draw();
    },

    /**
     * 마우스 포지션이 container 영역을 벗어났는지 확인한다.
     * @param {number} pageX    마우스 x좌표
     * @param {number} pageY    마우스 y 좌표
     * @return {{x: number, y: number}} x 또는 y 가 0보다 클 경우 + 방향으로 overflow. 작을경우 - 방향으로 overflow
     */
    overflowStatus: function(pageX, pageY) {
        var containerPosY = pageY - this.model.offsetTop - this.model.headerHeight,
            containerPosX = pageX - this.model.offsetLeft,
            status = {
                x: 0,
                y: 0
            };
        if (containerPosY > this.model.height + this.model.headerHeight) {
            status.y = 1;
        } else if (containerPosY < 0) {
            status.y = -1;
        }

        if (containerPosX > this.model.containerWidth) {
            status.x = 1;
        } else if (containerPosX < 0) {
            status.x = -1;
        }
        return status;
    },

    /**
     * 마우스 포지션에 해당하는 row 의 key 를 얻어온다.
     *
     * @param {number} pageX    마우스 x좌표
     * @param {number} pageY    마우스 y좌표
     * @return {(String|Number)} 해당 위치의 키값
     */
    getKey: function(pageX, pageY) {
        var model = this.model,
            scrollTop = model.scrollTop,
            rowHeight = model.rowHeight,
            offsetTop = model.offsetTop,
            height = model.height,
            border = this.grid.option('border'),
            headerHeight = model.headerHeight,
            containerPosY = pageY - offsetTop - headerHeight,
            dataPosY = scrollTop + containerPosY,
            status = this.overflowStatus(pageX, pageY),
            idx;
        if (status.y > 0) {
            dataPosY = scrollTop + height - 1;
        } else if (status.y < 0) {
            dataPosY = scrollTop + 1;
        }

        idx = Math.min(Math.max(0, Math.floor(dataPosY / (rowHeight + border))), model.collection.length - 1);
        return model.collection.at(idx) && model.collection.at(idx).id;
    },

    /**
     * 현재 정보를 가지고 selection 영역을 표시한다.
     */
    draw: function() {
        if (this.isShown && (this.rangeKey[0] !== -1 && this.rangeKey[1] !== -1)) {
            var collection = this.model.collection,
                border = this.grid.option('border'),
                start = collection.indexOf(collection.get(this.rangeKey[0])),
                end = collection.indexOf(collection.get(this.rangeKey[1])),
                totalRowCount = collection.length,
                startIdx = Math.min(start, end),
                endIdx = Math.max(start, end),
                top = Util.getHeight(startIdx, this.model.rowHeight, border) - border,
                height = Util.getHeight(((endIdx - startIdx) + 1), this.model.rowHeight, border),
                fixedTop, fixedDifference, fixedHeight,
                width = this.model.width - 3,
                display = 'block';

            fixedTop = Math.max(this.model.scrollTop - 10, top) - 1;
            fixedDifference = fixedTop - top;
            if (endIdx === totalRowCount) { }
            fixedHeight = Math.min(this.model.height + 10, height - fixedDifference) - 2;

            if (fixedHeight <= 0) {
                display = 'none';
            }

            //크기 줄이기 위해 보정

            this.$el.css({
                width: width + 'px',
                top: fixedTop + 'px',
                height: fixedHeight + 'px',
                display: display
            });
        } else {
            this.$el.css({
                display: 'none'
            });
            if (this.isShown) {
                this.grid.view.keyboard.$el.val('');
            }
        }
    },

    /**
     * 랜더링한다.
     * @return {Selection}
     */
    render: function() {
        var color = this.grid.option('color'),
            opacity = this.grid.option('opacity');

        this._detachHandler();
        this.$el.css({
            width: '100%',
            background: color['selection'],
            opacity: opacity
        });
        this.draw();

        this._attachHandler();
        return this;
    },

    /**
     * 소멸자
     */
    destroy: function() {
        this.detachMouseEvent();
        this.destroyChildren();
        this._detachHandler(this.$el);
        this.$el.empty().remove();
    }
});

/**
 * @fileoverview 테이블 헤더의 우측 영역(Scroll) 에 자리하는 Spacer View
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Spacer View
 * 테이블 헤더의 우측 영역(Scroll) 에 자리하는 Spacer View
 * @constructor Spacer
 */
var Spacer = ne.util.defineClass(Base.View, /**@lends Spacer.prototype */{
    eventHandler: {},
    className: 'infinite_spacer',
    style: 'display: block;	position: absolute;	top: 0;	right: 0; width: 16px;',
    /**
     * 생성자
     * @param attributes
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
    },

    /**
     * 렌더링 한다.
     * @return {Spacer}
     */
    render: function() {
        var grid = this.grid,
            color = grid.option('color'),
            height = grid.option('headerHeight'),
            border = grid.option('border'),
            top = border ? 0 : 1,
            right = border ? 0 : 1,
            width = 17 - border,
            css = {
                top: top + 'px',
                right: right + 'px',
                background: color['th'],
                height: height + 'px',
                width: width + 'px',
                border: 'solid ' + border + 'px ' + color['border']
            };

        this._detachHandler();
        this.destroyChildren();
        this.$el.css(css);
        this._attachHandler();
        return this;
    }
});

/**
 * @fileoverview 가상 스크롤바
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * VirtualScrollBar
 * @constructor VirtualScrollBar
 */
var VirtualScrollBar = ne.util.defineClass(Base.View, /**@lends VirtualScrollBar.prototype */{
    className: 'infinite_virtial_scrollbar',
    eventHandler: {
        'scroll': '_onScroll'
    },
    style: 'overflow-y: scroll; overflow-x: hidden; position: absolute; top: 0; right: 0; display: block;',
    /**
     * 생성자
     * @param attributes
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.model.on({
            'change': this._onModelChange
        }, this);
        this.setOwnProperties({
            timeoutIdForLock: 0,
            isScrollHandlerFocused: false
        });
    },

    /**
     * 마우스다운 event handler
     * @private
     */
    _onMouseDown: function() {
        this.model.collection.lock();
        this.grid.updateLayoutData();
        this.isScrollHandlerFocused = true;
        this._updateUnlockTimeout();
    },

    /**
     * 스크롤 핸들러로 스크롤 했을 때, unlock timer 를 업데이트 한다.
     * @private
     */
    _updateUnlockTimeout: function() {
        if (this.isScrollHandlerFocused) {
            clearTimeout(this.timeoutIdForLock);
            this.model.collection.lock();
            this.timeoutIdForLock = setTimeout($.proxy(function() {
                this.isScrollHandlerFocused = false;
                this.model.collection.unlock();
            }, this), 1000);
        }
    },

    /**
     * scroll event handler
     * @param {event} scrollEvent 스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        this.model.set('scrollTop', $(scrollEvent.target).scrollTop());
        this._updateUnlockTimeout();
        this.isScrollHandlerFocused = true;
    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     *
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'scrollTop') {
            this.isScrollHandlerFocused = false;
            this._onScrollTopChange(value);
        } else if (key === 'headerHeight') {
            this.$el.css('top', value + 'px');
        } else {
            this._setContentHeight();
        }
    },

    /**
     * scrollTop 값을 동기화한다.
     * @param {number} scrollTop    scrollTop 값
     * @private
     */
    _onScrollTopChange: function(scrollTop) {
        this.el.scrollTop = scrollTop;
    },

    /**
     * 현재 랜더링을 기준으로 max scroll top 을 확인한다.
     * @return {number} 계산된 max scroll top 값
     * @private
     */
    _getMaxScrollTop: function() {
        return this.$el.find('.infinite_content').height() - this.$el.innerHeight();
    },

    /**
     * 렌더링 한다.
     * @return {VirtualScrollBar}
     */
    render: function() {
        this._detachHandler();
        var width = this.grid.scrollBarSize + 1,
            right = (this.grid.option('border') === 0) ? 1 : 0,
            content = this.createView(VirtualScrollBar.Content, {
                grid: this.grid
            }),
            border = this.grid.option('border'),
            top;
        if (this.grid.option('hasHeader')) {
            top = this.grid.option('headerHeight') + ((border * 2) || 2);
        } else {
            top = 1;
        }

        this.$el.css({
            //height: this.grid.option('scrollX') ? this.model.height + this.grid.scrollBarSize : this.model.height,
            height: this.model.height,
            top: top,
            right: right,
            width: width + 'px'
        });
        this.$el.empty();
        this.$el.html(content.render().el);

        this._setContentHeight();
        this._attachHandler();
        return this;
    },

    /**
     * virtual scroll bar 의 높이를 계산하여 지정한다.
     * @private
     */
    _setContentHeight: function() {
        var border = this.grid.option('border'),
            rowHeight = this.grid.option('rowHeight'),
            rowCount = this.model.collection.length,
            height = Util.getHeight(rowCount, rowHeight, border),
            maxTop;
        //
        //if (this.grid.option('scrollX')) {
        //    height += this.grid.scrollBarSize;
        //}

        this.$el.find('.infinite_content').height(height);
        maxTop = this.model.getMaxScrollTop();
        this.model.set('maxScrollTop', maxTop);
    },

    /**
     * 가상 스크롤바의 content 영역의 높이를 가져온다.
     * @return {number} content 의 height 값
     * @private
     */
    _getContentHeight: function() {
        return this.$el.find('.infinite_content').height();
    }
});
/**
 * VirtualScrollBar.Content
 * @constructor VirtualScrollBar.Content
 */
VirtualScrollBar.Content = ne.util.defineClass(Base.View, /**@lends VirtualScrollBar.Content.prototype */{
    className: 'infinite_content',
    style: 'width: 1px; display: block; background: transparent;',
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
    },
    render: function() {
        return this;
    }
});

/**
 * @fileoverview SimpleGrid 컴포넌트 본체
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Simple Grid
 * @constructor
 * @example
 //Simple Grid 인스턴스 생성
    var simpleGrid = new ne.component.SimpleGrid({
        $el: $('#simpleGrid2'),
        rowHeight: 25,    //line 당 pixel
        displayCount: 20,  //영역에 보여줄 line 갯수
        headerHeight: 30,
        scrollX: false,
        scrollY: true,
        keyEventBubble: false,  //key 입력시 이벤트 버블링 할지 여부
        defaultColumnWidth: 50,
        //keyColumnName: 'column1',
        color: {
            border: 'red',
            th: 'yellow',
            td: '#FFFFFF',
            selection: 'blue'
        },
        className: {
            table: 'table_class',
            tr: 'tr_class',
            td: 'td_class'
        },
        border: 0,
        opacity: '0.5',
        columnModelList: [
            {
                columnName: 'column1',
                title: '컬럼1',
                width: 70,
                align: 'center',
                formatter: function(value, rowData) {
                    return '<input type="button" class="test_click" value="' + value + '"/>';
                }
            },
            {
                columnName: 'column2',
                title: '컬럼2',
                width: 60
            },
            {
                columnName: 'column3',
                title: '컬럼3',
                width: 70
            },
            {
                columnName: 'column4',
                title: '컬럼4',
                width: 80
            },
            {
                columnName: 'column5',
                title: '컬럼5',
                width: 90
            }
        ]
    });
 */
ne.component.SimpleGrid = ne.util.defineClass(Base.View, /**@lends ne.component.SimpleGrid.prototype */{
    /**
     * 스크롤바 사이즈
     * @type {Number}
     */
    scrollBarSize: 17,

    /**
     * 방향키 스크롤 시 입력당 이동 단위 pixel
     * @type {Number}
     */
    scrollingScale: 40,

    /**
     * page up/ down 스크롤 시 입력당 이동 단위 %
     * @type {Number}
     */
    scrollingScalePerPage: 90,

    /**
     * IE 랜더링 가능한 MaxHeight 값. 1533917 is the max height of IE (66692*23 + 1)
     * @type {Number}
     */
    ieMaxHeight: 1533917,
    className: 'simple_grid',
    eventHandler: {
        'mouseover': '_onMouseOver',
        'mouseout': '_onMouseOut',
        'mousedown': '_onMouseDown',
        'focus': '_onFocus'
    },

    /**
     *  @param {Object} options 옵션 객체
     *      @param {jQuery} options.$el root 엘리먼트
     *      @param {number} [options.headerHeight=30]  header 영역의 높이값
     *      @param {number} [options.hasHeader=true] header 를 노출할지 여부.
     *      @param {number} [options.height]    grid 의 높이값. displayCount 보다 우선한다.
     *      @param {number} [options.useSelection=true]    selection 기능을 사용할 지 여부
     *      @param {number} [options.useColumnResize=true]    열 resize 기능을 사용할 지 여부
     *      @param {number} [options.rowHeight=20] 한 행의 높이값. height 가 설정될 경우 무시된다.
     *      @param {number} [options.displayCount=15] 한 화면에 보여질 행 개수
     *      @param {boolean} [options.scrollX=true] 가로 스크롤 사용 여부
     *      @param {boolean} [options.scrollY=true] 세로 스크롤 사용 여부
     *      @param {boolean} [options.scrollFix=true] prepend 로 데이터 추가 시 현재 scroll 위치 유지 여부
     *      @param {object} [options.defaultColumnWidth=50] 컬럼 모델에 너비 값을 지정하지 않았을 때 설정될 기본 column 너비
     *      @param {object} [options.minimumColumnWidth=20] resize 시 최소 컬럼 너비값
     *      @param {object} [options.idAttribute=null] 행의 key 값으로 사용될 필드명. 값을 지정하지 않을경우 내부에서 자동으로 값을 생성한다.
     *      @param {object} [options.columnModelList=[]] 컬럼모델 정보
     *          @param {string} [options.columnModelList.columnName] data field 명
     *          @param {string} [options.columnModelList.title] Header 영역에 표시될 컬럼 이름
     *          @param {(number|string)} [options.columnModelList.width] 해당 컬럼의 너비. %로 지정할 수 있음
     *          @param {string} [options.columnModelList.align] 해당 컬럼의 정렬기준
     *          @param {function} [options.columnModelList.formatter] 데이터를 화면에 표시할 때 값의 포맷팅 처리를 하기 위한 함수.
     *          값을 출력하기 전에 formatter 함수에 해당 컬럼의 값을 전달하고 해당 함수가 리턴한 값을 화면 상에 표시한다.
     *      @param {object} [options.opacity=0.2] 선택 영역 레이어 투명도
     *      @param {object} [options.border=1] 테이블 border 두께
     *      @param {object} [options.color] 색상 정보
     *          @param {string} [options.color.border='#EFEFEF']  태두리 색상
     *          @param {string} [options.color.th='#F8F8F8']  테이블 헤더 색상
     *          @param {string} [options.color.td='#FFFFFF']  테이블 바디 색상
     *          @param {string} [options.color.selection='orange']  선택영역 색상
     *      @param {object} [options.className] table 의 디자인 클래스 정보
     *          @param {string} [options.className.table]   table 의 className 정의
     *          @param {string} [options.className.tr]  tr의 className 정의
     *          @param {string} [options.className.td]  td의 className 정의
     * @return {ne.component.SimpleGrid}
     */
    init: function(options) {
        Base.View.prototype.init.apply(this, arguments);

        var id = this.getUniqueKey(),
            defaultOptions = {
                rowHeight: 20,    //line 당 pixel
                displayCount: 10,  //영역에 보여줄 line 갯수
                headerHeight: 30,
                scrollX: true,
                scrollY: true,
                freeze: true,    //Data Prepend 시 현재  scroll 된 위치를 유지할 것인지 여부
                keyEventBubble: false,  //key 입력시 이벤트 버블링 할지 여부
                idAttribute: null,
                columnModelList: [],
                defaultColumnWidth: 50,
                useSelection: true,
                useColumnResize: true,
                hasHeader: true,
                minimumColumnWidth: 20,
                className: {
                    table: '',
                    tr: '',
                    td: ''
                },
                color: {
                    border: '#EFEFEF',
                    th: '#F8F8F8',
                    td: '#FFFFFF',
                    selection: 'orange'
                },
                border: 1,
                opacity: '0.2'
            };

        this.__instance[id] = this;
        options = $.extend(true, defaultOptions, options);

        this.setOwnProperties({
            id: id,
            model: null,
            focusModel: null,
            view: {
                header: null,
                spacer: null,
                container: null,
                virtualScroll: null,
                keyboard: null
            },
            options: options,
            timeoutIdForBlur: 0
        });
        if (!this.option('hasHeader')) {
            this.option('headerHeight', 0);
        }
        this._initializeModel();
        this._initializeView();
        this.render();
        this._initializeCustomEvent();
        return this;
    },

   /**
     * 커스텀 이벤트를 초기화 한다.
     * @private
     */
    _initializeCustomEvent: function() {
        this.view.container.body.on('click', function(customEvent) {
            return this.invoke('click', customEvent);
        }, this);
    },

    /**
     * focus 발생시 이벤트 핸들러
     */
    focus: function() {
        this.view.keyboard.$el.focus().select();
    },

    /**
     * blur 발생시 selection 영역 숨김처 한다.
     */
    blur: function() {
        this.view.container.selection.hide();
    },

    /**
     * view 에서 참조할 모델을 초기화한다.
     * @private
     */
    _initializeModel: function() {
        this.model = new Model({
            grid: this
        });
        this.focusModel = new Focus({
            grid: this
        });
    },

    /**
     * 내부에서 사용할 view 를 초기화한다.
     * @private
     */
    _initializeView: function() {
        this.view.header = this.createView(Header, {
            grid: this,
            model: this.model
        });
        this.view.spacer = this.createView(Spacer, {
            grid: this,
            model: this.model
        });
        this.view.container = this.createView(Container, {
            grid: this,
            model: this.model
        });
        this.view.keyboard = this.createView(Keyboard, {
            grid: this,
            model: this.model
        });
    },

    /**
     * 마우스 down 이벤트 핸들러
     * @private
     */
    _onMouseDown: function() {
        $(document).on('mouseup', $.proxy(this._onMouseUp, this));
        this.model.collection.lock();
        this.updateLayoutData();
        clearTimeout(this.timeoutIdForBlur);
        this.timeoutIdForBlur = setTimeout($.proxy(function() {
            this.focus();
        }, this), 0);
    },

    /**
     * 마우스 up 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        this.model.collection.unlock();
        $(document).off('mouseup', $.proxy(this._onMouseUp, this));
    },

    /**
     * 선택영역 selection instance 를 반환한다. 내부 수행 로직에 사용된다.
     * @return {Object} Selection 인스턴스
     */
    getSelectionInstance: function() {
        return this.view.container.selection;
    },

    /**
     * scroll content 에 노출될 data list 를 저장한다.
     * @param {array} list
     * @return {ne.component.SimpleGrid}
     * @example
     simpleGrid.setList([
        {
            column1: 1,
            column2: 2,
            column3: 3,
            column4: 4,
            column5: 5
        },
        {
            column1: 1,
            column2: 2,
            column3: 3,
            column4: 4,
            column5: 5
        }
     ]);
     */
    setList: function(list) {
        this.clear();
        this.model.collection.set(list);
        return this;
    },

    /**
     * id 에 해당하는 row 를 삭제한다.
     * @param {*} id 삭제할 키값 혹은 키값의 list
     * @return {ne.component.SimpleGrid}
     */
    remove: function(id) {
        var idList = ne.util.isArray(id) ? id : [id];
        this.model.collection.remove(idList);
        return this;
    },

    /**
     * scroll content 에 노출될 data list 를 append 한다.
     *
     * @param {array} list append 할 데이터 list
     * @return {ne.component.SimpleGrid}
     */
    append: function(list) {
        this.model.collection.append(list);
        return this;
    },

    /**
     * scroll content 에 노출될 data list 를 prepend 한다.
     * @param {array} list prepend 할 데이터 list
     * @return {ne.component.SimpleGrid}
     */
    prepend: function(list) {
        this.model.collection.prepend(list);
        return this;
    },

    /**
     * 노출된 데이터를 전부 제거 한다.
     * @return {ne.component.SimpleGrid}
     */
    clear: function() {
        this.model.collection.clear();
        return this;
    },

    /**
     * 현재 Grid 에 저장된 데이터 정보를 가져온다.
     * @return {list|*|Collection.list}
     */
    getList: function() {
        return this.model.collection.list;
    },

    /**
     * 랜더링한다.
     * @return {ne.component.SimpleGrid}
     */
    render: function() {
        this.destroyChildren();
        this._detachHandler();
        this.$el.attr({
            instanceId: this.id
        }).css({
            position: 'relative'
        });
        this.$el.empty();

        this.$el.append(this.view.header.render().el)
            .append(this.view.spacer.render().el);

        this.$el.append(this.view.container.render().el)
            .append(this.view.keyboard.render().el);

        if (this.option('scrollY')) {
            this.view.virtualScroll = this.createView(VirtualScrollBar, {
                grid: this,
                model: this.model
            });
            this.$el.append(this.view.virtualScroll.render().el);
        }
        this.updateLayoutData();
        this._attachHandler();
        return this;
    },

    /**
     * model 의 layout 관련 데이터를 갱신한다.
     */
    updateLayoutData: function() {
        var offset = this.$el.offset();
        this.model.set({
            offsetTop: offset.top,
            offsetLeft: offset.left,
            containerWidth: this.view.container.$el.width(),
            containerHeight: this.view.container.$el.height()
        });
    },

    /**
     * 설정된 옵션값을 가져오거나 변경한다.
     * @param {(number | string)} key
     * @param {*} [value]
     * @return {*}
     */
    option: function(key, value) {
        if (value === undefined) {
            return this.options[key];
        } else {
            this.options[key] = value;
            return this;
        }
    }
});
/* istanbul ignore next*/
ne.component.SimpleGrid.prototype.__instance = {};
/**
 * id 에 해당하는 인스턴스를 반환한다.
 * @param {number} id
 * @return {object}
 */
ne.component.SimpleGrid.getInstanceById = function(id) {
    return this.__instance[id];
};

})();