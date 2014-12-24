/**
 * @fileoverview 리사이즈 핸들러
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * ResizeHandlerContainer
 * @constructor ResizeHandlerContainer
 */
var ResizeHandlerContainer = ne.util.defineClass(Base.View, /**@lends ResizeHandlerContainer.prototype */{
    className: 'infinite_resize_handler_container',
    eventHandler: {
        //'scroll': '_onScroll'
        'mousedown .infinite_resize_handler' : '_onMouseDown'
    },
    style: 'position:relative',
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
     *
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
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
            length = columnModelList.length;

        this._detachHandler();
        this.destroyChildren();
        this.$el.empty();

        ne.util.forEachArray(columnModelList, function(columnModel, index) {
            var handler = this.createView(ResizeHandler, {
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
     * 생성된 핸들러의 위치를 설정한다.
     * @private
     */
    _refreshHandlerPosition: function() {
        var columnWidthList = this.model.columnWidthList,
            $resizeHandleList = this.$el.find('.infinite_resize_handler'),
            lastIndex = columnWidthList.length - 1,
            border = this.grid.option('border'),
            curPos = 0;

        ne.util.forEachArray($resizeHandleList, function(item, index) {
            var $handler = $resizeHandleList.eq(index),
                width = this.model.width - $handler.width();
            if (lastIndex === index) {

                $handler.css('left', width + 'px');
            } else {
                curPos += columnWidthList[index] + border;
                $handler.css('left', (curPos - 3) + 'px');
            }

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


var ResizeHandler = ne.util.defineClass(Base.View, /**@lends ResizeHandler.prototype */{
    className: 'infinite_resize_handler',
    eventHandler: {

    },
    style: 'float:left; position:absolute; height:100%; background:red; opacity:0.3; cursor:col-resize;',
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.setOwnProperties({
            columnName: attributes.columnName,
            index: attributes.index,
            isLast: attributes.isLast
        });
    },
    render: function() {
        this._detachHandler();
        this.destroyChildren();
        this.$el.empty();
        this.$el.attr({
            'columnindex': this.index,
            'columnname': this.columnName,
            'title': '마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,더블클릭을 통해 넓이를 초기화할 수 있습니다.'
        });
        if (this.isLast) {
            this.$el.width(3);
        } else {
            this.$el.width(7);
        }
        this._attachHandler();
        return this;
    }
});
