/**
 * @fileoverview Selection 영역을 담당
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
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
