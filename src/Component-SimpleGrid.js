    /**
     * Infinite Scroll
     * @constructor
     * @example
     //Infinite Scroll 인스턴스 생성
        var infinite = new ne.Component.SimpleGrid({
            $el : $('#infiniteScroll'),    //무한 스크롤을 생성할 div jQuery 엘리먼트
            lineHeight : 20,    //한 행의 높이에 (default : 20)
            displayCount : 15,    //화면에 보여질 line 갯수 (default : 15)
            scrollX : true,        //가로 스크롤 여부    (default : true)
            scrollY : true,        //세로 스크롤 여부    (default : true)
            scrollFix : true    //prepend 로 데이터 추가 시 현재 scroll 영역 유지 여부 (default : true)
        });
        infinite.setList(dummy.real);    //배열을 인자로 데이터 설정

        //infinite.append(dummy.append);    //배열을 인자로 하여 데이터 append
        //infinite.prepend(dummy.append);    //배열을 인자로 하여 데이터 prepend
        //infinite.clear();                    //데이터 초기화
        //var dataList = infinite.getList();    //배열 형태로 현재 data 를 가져온다.
     */
    ne.Component.SimpleGrid = ne.util.defineClass(Base.View, {
        scrollBarSize: 17,
        className: 'simple_grid',
        eventHandler: {
            'mousedown' : '_onMouseDown',
            'focus' : '_onFocus'
        },
        style: 'position: relative;',
        init: function(options) {
            Base.View.prototype.init.apply(this, arguments);

            var id = this.getUniqueKey(),
                defaultOptions = {
                    lineHeight: 20,    //line 당 pixel
                    displayCount: 10,  //영역에 보여줄 line 갯수
                    scrollX: true,
                    scrollY: true,
                    freeze: true,    //Data Prepend 시 현재  scroll 된 위치를 유지할 것인지 여부
                    keyEventBubble: false,  //key 입력시 이벤트 버블링 할지 여부
                    columnList: [],
                    color: {
                        border: '#EFEFEF',
                        td: '#FFFFFF',
                        th: '#F8F8F8',
                        selection: 'blue'
                    },
                    opacity: '0.2'


                };

            this.__instance[id] = this;
            options = $.extend(true, defaultOptions, options);

            this.setOwnProperties({
                id: id,
                model: null,
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
            this._initializeModel();
            this._initializeView();
            this.render();

            return this;
        },
        /**
         * 스크롤 영역 focus 되었을 때
         */
        focus: function() {
            this.view.keyboard.$el.focus().select();
            this.view.container.selection.show();
        },
        /**
         * 스크롤 영역 blur 시
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
        },
        /**
         * 내부에서 사용할 view 를 초기화한다.
         * @private
         */
        _initializeView: function() {
            this.view.container = this.createView(Container, {
                grid: this,
                model: this.model
            });
            this.view.keyboard = this.createView(Keyboard, {
                grid: this,
                model: this.model
            });
            this.view.header = this.createView(Header, {
                grid: this,
                model: this.model
            });
            this.view.spacer = this.createView(Spacer, {
                grid: this,
                model: this.model
            });
        },
        /**
         * mousedown event handler
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
         * mouseup event handler
         * @private
         */
        _onMouseUp: function() {
            this.model.collection.unlock();
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
        },
        /**
         * selection instance 를 반환한다.
         * @return {Selection|g.content.selection|*|selection|Container.content.selection|g.selection}
         */
        getSelectionInstance: function() {
            return this.view.container.selection;
        },
        /**
         * scroll content 에 노출될 data list 를 저장한다.
         *
         * @param {array} list
         * @return {window.ne.Component.SimpleGrid}
         */
        setList: function(list) {
            this.clear();
            this.model.collection.set(list);
            return this;
        },
        /**
         * scroll content 에 노출될 data list 를 append 한다.
         *
         * @param {array} list
         * @return {window.ne.Component.SimpleGrid}
         */
        append: function(list) {
            this.model.collection.append(list);
            return this;
        },
        /**
         * scroll content 에 노출될 data list 를 prepend 한다.
         *
         * @param {array} list
         * @return {window.ne.Component.SimpleGrid}
         */
        prepend: function(list) {
            this.model.collection.prepend(list);
            return this;
        },
        /**
         * 노출된 데이터를 전부 초기화 한다.
         *
         * @return {window.ne.Component.SimpleGrid}
         */
        clear: function() {
            this.model.collection.clear();
            return this;
        },
        /**
         * 현재 저장된 데이터 정보를 가져온다.
         * @return {list|*|Collection.list}
         */
        getList: function() {
            return this.model.collection.list;
        },
        /**
         * 스크롤을 랜더링한다.
         *
         * @return {window.ne.Component.SimpleGrid}
         */
        render: function() {
            this.destroyChildren();
            this._detachHandler();
            this.$el.attr({
                instanceId: this.id
            });
            this.$el.empty()
                .append(this.view.header.render().el)
                .append(this.view.spacer.render().el)
                .append(this.view.container.render().el)
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
                headerHeight: this.view.header.$el.outerHeight(),
                containerWidth: this.view.container.$el.width(),
                containerHeight: this.view.container.$el.height()
            });
        },
        /**
         * 설정된 옵션값을 가져오거나 변경한다..
         *
         * @param {(number | string)} key
         * @param {*} value
         * @return {*}
         */
        option: function(key, value) {
            if (value === undefined) {
                return this.options[key];
            }else {
                this.options[key] = value;
                return this;
            }
        }
    });
    /**
     * SimpleGrid instance container
     * @type {{}}
     */
    ne.Component.SimpleGrid.prototype.__instance = {};
    /**
     *
     * @param {number} id
     * @return {object}
     */
    ne.Component.SimpleGrid.getInstanceById = function(id) {
        return this.__instance[id];
    };
