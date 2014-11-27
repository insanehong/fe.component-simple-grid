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
            'mousedown' : '_onMouseDown'
        },
        className: 'infinite_selection_layer',
        style: 'display:none;position:absolute;top:0;left:1px;width:0;height:0;border:dotted 1px red;background:orange;opacity:0.2;filter:alpha(opacity=10)',
        init: function(attributes) {
            Base.View.prototype.init.apply(this, arguments);
            this.grid.view.keyboard.on({
                'blur' : this.stopSelection
            }, this);
            this.model.on({
                'change' : this._onModelChange
            }, this);
            this.setOwnProperties({
                rangeKey: [-1, -1],
                isShown: false
            });
        },
        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            this.invoke('mousedown', mouseDownEvent);
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
            if (key === 'headerHeight' || key === 'top') {
                this.draw();
            } else if (key === 'width') {
                this.$el.width(value - 3);
            }
        },
        /**
         * selection range 를 반환한다.
         * @return {Array}
         */
        getSelectionRange: function() {
            return this.rangeKey;
        },
        /**
         * selection 된 시작과 끝 영역의 index 를 리턴한다.
         * @return {Array}
         */
        getSelectionRangeIndex: function() {
            var range = [
                    this.model.collection.indexOf(this.model.collection.get(this.rangeKey[0])),
                    this.model.collection.indexOf(this.model.collection.get(this.rangeKey[1]))
                ],
                startIdx = Math.min.apply(Math, range),
                endIdx = Math.max.apply(Math, range);
            return [startIdx, endIdx];
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
         * @param {number} key
         */
        startSelection: function(key) {
            if (key !== -1) {
                this.rangeKey[0] = key;
                this.updateSelection(key);
            }
        },
        /**
         * selection 영역을 update 한다.
         * @param {number} key
         */
        updateSelection: function(key) {
            if (key !== -1) {
                this.rangeKey[1] = key;
                this.show();
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
                    var columnName = columnModel['columnName'];
                    columnStringList.push(collection.data[columnName]);
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
         * seleciton 을 중지한다.
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
         * @param {number} pageX
         * @param {number} pageY
         * @return {{x: number, y: number}}
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
            }else if (containerPosY < 0) {
                status.y = -1;
            }

            if (containerPosX > this.model.containerWidth) {
                status.x = 1;
            }else if (containerPosX < 0) {
                status.x = -1;
            }
            return status;
        },
        /**
         * 마우스 포지션에 해당하는 selection key 를 얻어온다.
         *
         * @param {number} pageX
         * @param {number} pageY
         * @return {*}
         */
        getSelectionKey: function(pageX, pageY) {
            var containerPosY = pageY - this.model.offsetTop - this.model.headerHeight,
                dataPosY = this.model.scrollTop + containerPosY,
                status = this.overflowStatus(pageX, pageY),
                idx;
            if (status.y > 0) {
                dataPosY = this.model.scrollTop + this.model.height - 1;
            }else if (status.y < 0) {
                dataPosY = this.model.scrollTop + 1;
            }

            idx = Math.min(Math.max(0, Math.floor(dataPosY / this.model.lineHeight)), this.model.collection.length - 1);
            return this.model.collection.at(idx) && this.model.collection.at(idx).id;
        },
        /**
         * 현재 정보를 가지고 selection 영역을 표시한다.
         */
        draw: function() {
            if (this.isShown && (this.rangeKey[0] !== -1 && this.rangeKey[1] !== -1)) {
                var start = this.model.collection.indexOf(this.model.collection.get(this.rangeKey[0])),
                    end = this.model.collection.indexOf(this.model.collection.get(this.rangeKey[1])),
                    startIdx = Math.min(start, end),
                    endIdx = Math.max(start, end),
                    top = startIdx * this.model.lineHeight,
                    height = ((endIdx - startIdx) + 1) * this.model.lineHeight,
                    fixedTop, fixedDifference, fixedHeight,
                    display = 'block';

                fixedTop = Math.max(this.model.scrollTop - 10, top) - 1;
                fixedDifference = fixedTop - top;
                fixedHeight = Math.min(this.model.height + 10, height - fixedDifference) - 2;

                if (fixedHeight <= 0) {
                    display = 'none';
                }

                //크기 줄이기 위해 보정
                this.$el.css({
                    top: fixedTop + 'px',
                    height: fixedHeight + 'px',
                    display: display
                });
            }else {
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
        }
    });