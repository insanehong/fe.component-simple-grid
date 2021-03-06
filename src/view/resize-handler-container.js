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
