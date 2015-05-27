/**
 * @fileoverview SimpleGrid 컴포넌트 본체
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
ne.util.defineNamespace('ne.component');
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
        columnModelList: [v
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
        this._initializeStyleSheet();
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
     * 디자인 style 태그를 붙인다.
     * @private
     */
    _initializeStyleSheet: function() {
        var styleList = [];
        if (Util.isMacOs()) {
            styleList = [
                '.simple_grid {scrollbar-highlight-color:#f2f2f2;scrollbar-shadow-color:#f2f2f2;scrollbar-arrow-color:#8a8a8a;scrollbar-face-color:#d9d9d9;scrollbar-3dlight-color:#f2f2f2;scrollbar-darkshadow-color:#f2f2f2;scrollbar-track-color:#f2f2f2;}',
                '.simple_grid ::-webkit-scrollbar{-webkit-appearance: none;width:17px;height:17px;background-color:#f2f2f2;}',
                '.simple_grid ::-webkit-scrollbar-thumb{background-color:#d9d9d9;border:5px solid transparent;border-radius:7px;background-clip:content-box;}',
                '.simple_grid ::-webkit-scrollbar-thumb:hover{background-color: #c1c1c1;}',
                '.simple_grid ::-webkit-scrollbar-corner{background-color: #f2f2f2;}'
            ];
        }
        if (!$('#simple_grid_style').length) {
            $('html > head').append($('<style id="simple_grid_style">\n' + styleList.join('\n') + '</style>'));
        }
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
