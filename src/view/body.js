/**
 * @fileoverview Body View
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Body View
     * @constructor Body
     */
    var Body = ne.util.defineClass(Base.View, /**@lends Body.prototype */{
        eventHandler: {
            'mousedown' : '_onMouseDown',
            'selectstart' : '_onSelectStart'
        },
        className: 'infinite_body',
        style: 'position: absolute; top: 0; white-space: nowrap;',
        init: function(attributes) {
            Base.View.prototype.init.apply(this, arguments);
            this.setOwnProperties({
                selection: attributes.selection,
                selectionStatus: false,
                selectionHandler: {
                    'mousemove' : $.proxy(this._onMouseMoveSelection, this),
                    'mouseup' : $.proxy(this._onMouseUpSelection, this),
                    'selectstart' : $.proxy(this._onSelectStart, this)
                },
                mousePos: {
                    pageX: 0,
                    pageY: 0
                },
                timeoutForUpdateSelection: 0
            });
            this.model.on({
                'change' : this._onModelChange,
                'refresh' : this._onRefresh
            }, this);

            this.selection.on({
                'mousedown' : this._onMouseDown
            }, this);
            this.grid.view.container.on({
                'scroll' : this._onScroll
            }, this);
        },
        /**
         * scroll event handler
         * @private
         */
        _onScroll: function() {
            if (this.selectionStatus) {
                this._updateSelection();
            }else {
                this.selection.draw();
            }
        },
        /**
         * mouseDown
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            mouseDownEvent.preventDefault();
            this._setMousePos(mouseDownEvent);
            if (mouseDownEvent.shiftKey) {
                if (this.selection.getSelectionRange()[0] === -1) {
                    this._startSelection(mouseDownEvent.pageX, mouseDownEvent.pageY);
                }else {
                    this._updateSelection();
                }
            }else {
                this._startSelection(mouseDownEvent.pageX, mouseDownEvent.pageY);
            }
        },
        /**
         * selection start 시 영역 선택하지 않도록 prevent default
         * @param {event} selectStartEvent
         * @return {boolean}
         * @private
         */
        _onSelectStart: function(selectStartEvent) {
            /* istanbul ignore next: selectStartEvent 확인 불가 */
            selectStartEvent.preventDefault();
            return false;
        },
        /**
         * selection start
         * @param {number} pageX
         * @param {number} pageY
         * @private
         */
        _startSelection: function(pageX, pageY) {
            var key = this.selection.getSelectionKey(pageX, pageY);
            this.selectionStatus = true;
            this.selection.startSelection(key);
            $(document).on('mousemove', this.selectionHandler.mousemove);
            $(document).on('mouseup', this.selectionHandler.mouseup);
            $(document).on('selectstart', this.selectionHandler.selectstart);
        },
        /**
         * selection 에서 mouse move 시
         * @param {event} mouseMoveEvent
         * @private
         */
        _onMouseMoveSelection: function(mouseMoveEvent) {
            this._setMousePos(mouseMoveEvent);
            this._updateSelection();
        },
        /**
         * selection 영역 확장
         * @private
         */
        _updateSelection: function() {
            clearTimeout(this.timeoutForUpdateSelection);
            this.timeoutForUpdateSelection = setTimeout($.proxy(this._scrollOnSelection, this), 0);
            var key = this.selection.getSelectionKey(this.mousePos.pageX, this.mousePos.pageY);
            this.selection.updateSelection(key);
        },
        /**
         * selection 에서 mouseup 시
         * @param {event} mouseUpEvent
         * @private
         */
        _onMouseUpSelection: function(mouseUpEvent) {
            this._stopSelection();
        },
        /**
         * selection 중지
         * @private
         */
        _stopSelection: function() {
            this.selectionStatus = false;
            $(document).off('mousemove', this.selectionHandler.mousemove);
            $(document).off('mouseup', this.selectionHandler.mouseup);
            $(document).off('selectstart', this.selectionHandler.selectstart);

        },
        /**
         * selection 시 mouse pointer 가 영역을 벗어났을 시 자동 scroll
         * @private
         */
        _scrollOnSelection: function() {
            if (this.selectionStatus) {
                var status = this.selection.overflowStatus(this.mousePos.pageX, this.mousePos.pageY);
                if (status.y > 0) {
                    this.model.set('scrollTop', this.model.scrollTop + 40);
                }else if (status.y < 0) {
                    this.model.set('scrollTop', this.model.scrollTop - 40);
                }
                if (status.x > 0) {
                    this.model.set('scrollLeft', this.model.scrollLeft + 40);
                }else if (status.x < 0) {
                    this.model.set('scrollLeft', this.model.scrollLeft - 40);
                }
            }
        },
        /**
         * 현재 마우스 포인터 위치 저장
         * @param {event} mouseEvent
         * @private
         */
        _setMousePos: function(mouseEvent) {
            this.mousePos.pageX = mouseEvent.pageX;
            this.mousePos.pageY = mouseEvent.pageY;
        },
        /**
         * model 값이 변경되었을때 view 에 반영한다.
         *
         * @param {object} changeEvent
         * @private
         */
        _onModelChange: function(changeEvent) {
            var key = changeEvent.key,
                value = changeEvent.value;
            if (key === 'top') {
                this.$el.css('top', value + 'px');
            } else if (key === 'width') {
                this.$el.width(value);
            }
        },
        /**
         * model 의 refresh 이벤트가 발생했을 때 이벤트 핸들러
         * @private
         */
        _onRefresh: function() {
            this.render();
        },
        _template: {
            main: '<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
            '<colgroup>' +
            '<%=col%>' +
            '</colgroup>' +
            '<tbody>' +
            '<%=tbody%>' +
            '</tbody>',
            col: '' +
            '<col style="width: ' +
            '<%=width%>px">'
        },


        /**
         * 랜더링 한다.
         * @return {Body}
         */
        render: function() {
            this._detachHandler();
            this.destroyChildren();

            var list = this.model.list,
                columnModelList = this.grid.option('columnModelList'),
                html = '',
                tbody = '',
                height = this.model.lineHeight - 1,
                col = '',
                color = this.grid.option('color');


            ne.util.forEachArray(columnModelList, function(columnName) {
                col += '<col>' +
                '</col>';
            }, this);


            ne.util.forEachArray(list, function(item) {
                tbody += '<tr style="height:' + height + 'px" key="' + item.id + '">';
                ne.util.forEachArray(columnModelList, function(columnModel) {
                    var columnName = columnModel['columnName']
                    tbody += '<td columnname="' + columnName + '">' + item.data[columnName] + '</td>';
                });
                tbody += '</tr>';
            }, this);

            html = Util.template(this._template.main, {
                col: col,
                tbody: tbody
            });

            this.$el.html(html);
            this.$el.find('table').css('background', color['border']);
            this.$el.find('td').css('background', color['td']);
            this.model.set('width', Math.max(this._getMaxBodyWidth(), this.model.width));
            this.selection.draw();
            this._attachHandler();
            return this;
        },
        /**
         * size 를 정하기 위해 max content width 를 구한다.
         * @return {number}
         * @private
         */
        _getMaxBodyWidth: function() {
            var $spanList = this.$el.find('span'),
                widthList = [];

            ne.util.forEachArray($spanList, function(item, index) {
                widthList.push($spanList.eq(index).width());
            });

            return Math.max.apply(Math, widthList);
        }
    });
