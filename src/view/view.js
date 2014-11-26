    /**
     * Container View
     * @constructor
     */
    var ContainerView = ne.util.defineClass(Base.View, {
        className: 'infinite_container',
        eventHandler: {
            'scroll' : '_onScroll'
        },
        init: function(attributes) {
            Base.View.prototype.init.apply(this, arguments);

            this.model.on({
                'change' : this._onModelChange
            }, this);
            this._initializeCss();
        },
        /**
         * option 값에 맞춰 css 스타일을 지정한다.
         * @private
         */
        _initializeCss: function() {
           this.$el.css({
                'overflow-x' : this.grid.option('scrollX') ? 'scroll' : 'hidden',
                'overflow-y' : this.grid.option('scrollY') ? 'scroll' : 'hidden',
                'height' : this.grid.option('scrollX') ? this.model.height + this.grid.scrollBarSize : this.model.height
            });
        },
        /**
         * scroll event handler
         *  - scroll top 과 scroll left 를 동기화 한다.
         * @param {event} scrollEvent
         * @private
         */
        _onScroll: function(scrollEvent) {
            var difference = Math.abs(this.model.scrollTop - scrollEvent.target.scrollTop);
            //FF 에서의 스크롤 문제 해결
            if (difference < 10 && difference !== 0) {
                if (this.model.scrollTop > scrollEvent.target.scrollTop) {
                    scrollEvent.target.scrollTop -= 80;
                }else {
                    scrollEvent.target.scrollTop += 80;
                }
            }
            this.model.set({
                'scrollTop': scrollEvent.target.scrollTop,
                'scrollLeft' : scrollEvent.target.scrollLeft
            });
            this.invoke('scroll', scrollEvent);

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
         * @return {ContainerView}
         */
        render: function() {
            this._detachHandler();
            this.destroyChildren();

            this.selection = this.createView(SelectionView, {
                grid: this.grid,
                model: this.model
            });

            this.content = this.createView(ContentView, {
                grid: this.grid,
                selection: this.selection,
                model: this.model
            });
            this.$el.empty()
                .append(this.content.render().el)
                .append(this.selection.render().el);

            this._attachHandler();
            return this;
        }
    });


    /**
     * ContentView View
     * @constructor
     */
    var ContentView = ne.util.defineClass(Base.View, {
        eventHandler: {
            'mousedown' : '_onMouseDown',
            'selectstart' : '_onSelectStart'
        },
        className: 'infinite_data',
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
        /**
         * 랜더링 한다.
         * @return {ContentView}
         */
        render: function() {
            this._detachHandler();
            this.destroyChildren();
            var list = this.model.list;
            var html = '';
            html += '<ul>';
            ne.util.forEach(list, function(value, key) {
                html += '<li style="height:' + this.model.lineHeight + 'px" key="' + value.id + '"><span>' + value.data + '</span></li>';
            }, this);
            html += '</ul>';
            this.$el.html(html);
            this.model.set('width', Math.max(this._getMaxContentWidth(), this.model.width));
            this.selection.draw();
            this._attachHandler();
            return this;
        },
        /**
         * size 를 정하기 위해 max content width 를 구한다.
         * @return {number}
         * @private
         */
        _getMaxContentWidth: function() {
            var $spanList = this.$el.find('span'),
                widthList = [];

            ne.util.forEachArray($spanList, function(item, index) {
                widthList.push($spanList.eq(index).width());
            });

            return Math.max.apply(Math, widthList);
        }
    });


    /**
     * VirtualScrollBarView
     * @constructor
     */
    var VirtualScrollBarView = ne.util.defineClass(Base.View, {
        className: 'infinite_virtial_scrollbar',
        eventHandler: {
            'scroll' : '_onScroll'
        },
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
         * mousedown event handler
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
         * @param {event} scrollEvent
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
         * @param {object} changeEvent
         * @private
         */
        _onModelChange: function(changeEvent) {
            var key = changeEvent.key,
                value = changeEvent.value;
            if (key === 'scrollTop') {
                this.isScrollHandlerFocused = false;
                this._onScrollTopChange(value);
            } else {
                this._setContentHeight();
            }
        },
        /**
         * scrollTop 값을 동기화한다.
         * @param {number} scrollTop
         * @private
         */
        _onScrollTopChange: function(scrollTop) {
            this.el.scrollTop = scrollTop;
        },
        /**
         * 현재 랜더링을 기준으로 max scroll top 을 확인한다.
         * @return {number}
         * @private
         */
        _getMaxScrollTop: function() {
            return this.$el.find('.infinite_content').height() - this.$el.innerHeight();
        },
        /**
         * 렌더링 한다.
         * @return {VirtualScrollBarView}
         */
        render: function() {
            this._detachHandler();
            var $content = $('<div></div>').addClass('infinite_content');
            this.$el.css({
                'height' : this.grid.option('scrollX') ? this.model.height + this.grid.scrollBarSize : this.model.height
            });
            this.$el.empty();
            this.$el.html($content);
            this._setContentHeight();
            this._attachHandler();
            return this;
        },
        /**
         * virtual scroll bar 의 높이를 계산하여 지정한다..
         * @private
         */
        _setContentHeight: function() {
            var lineHeight = this.grid.option('lineHeight'),
                lineCount = this.model.collection.length,
                height = lineHeight * lineCount,
                maxTop;

            if (this.grid.option('scrollX')) {
                height += this.grid.scrollBarSize;
            }
            this.$el.find('.infinite_content').height(height);
            maxTop = this.model.getMaxScrollTop();
            this.model.set('maxScrollTop', maxTop);
        },
        /**
         * 가상 스크롤바의 content 영역의 높이를 가져온다.
         * @return {number}
         * @private
         */
        _getContentHeight: function() {
            return this.$el.find('.infinite_content').height();
        }
    });


    /**
     * KeyboardView
     * @constructor
     */
    var KeyboardView = ne.util.defineClass(Base.View, {
        keyMap: {
            'PAGE_UP' : 33,
            'PAGE_DOWN' : 34,
            'LEFT_ARROW' : 37,
            'UP_ARROW' : 38,
            'RIGHT_ARROW' : 39,
            'DOWN_ARROW' : 40,
            'HOME' : 36,
            'END' : 35,
            'CHAR_A' : 65,
            'CHAR_C' : 67,
            'CTRL' : 17,
            'META' : 91,
            'SHIFT' : 16
        },
        eventHandler: {
            'keydown' : '_onKeyDown',
            'keyup' : '_onKeyUp',
            'blur' : '_onBlur',
            'focus' : '_onFocus'
        },
        tagName: 'textarea',
        init: function(attributes) {
            Base.View.prototype.init.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForKeyDown: 0
            });
        },
        /**
         * focus event handler
         * @param {event} focusEvent
         * @private
         */
        _onFocus: function(focusEvent) {
            this.grid.getSelectionInstance().show();
        },
        /**
         * blur event handler
         * @param {event} blurEvent
         * @private
         */
        _onBlur: function(blurEvent) {
            this.model.collection.unlock();
            this.grid.blur();
        },
        /**
         * keyUp event handler
         * @param {event} keyUpEvent
         * @private
         */
        _onKeyUp: function(keyUpEvent) {
            this.model.collection.unlock();
        },
        /**
         * keyDown 시 이벤트 핸들러
         * @param {event} keyDownEvent
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
                    this.scrollVertical(-40);
                    break;
                case this.keyMap.DOWN_ARROW:
                    this.scrollVertical(+40);
                    break;
                case this.keyMap.LEFT_ARROW:
                    this.scrollHorizontal(-40);
                    break;
                case this.keyMap.RIGHT_ARROW:
                    this.scrollHorizontal(+40);
                    break;
                case this.keyMap.PAGE_UP:
                    this.scrollVertical(-90, true);
                    break;
                case this.keyMap.PAGE_DOWN:
                    this.scrollVertical(+90, true);
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
            clearTimeout(this.timeoutIdForKeyDown);
            if (window.clipboardData) {
                if (window.clipboardData.setData('Text', text)) {
                    this.$el.select();
                }else {
                    this.$el.val('').select();
                }
            }else {
                this.$el.val(text).select();
            }
            this.timeoutIdForKeyDown = setTimeout($.proxy(function() {
                this.$el.val('');
            }, this), 0);
        },
        /**
         * 세로 스크롤 한다.
         * @param {number} pixel
         * @param {boolean} [isPercentage]
         */
        scrollVertical: function(pixel, isPercentage) {
            pixel = isPercentage ? Math.floor(this.model.height * (pixel / 100)) : pixel;
            var scrollTop = Math.max(0, this.model.scrollTop + pixel);
            this.model.set('scrollTop', scrollTop);
        },
        /**
         * 가로 스크롤 한다.
         * @param {number} pixel
         */
        scrollHorizontal: function(pixel) {
            var scrollLeft = Math.max(0, this.model.scrollLeft + pixel);
            this.model.set('scrollLeft', scrollLeft);
        },
        /**
         * 랜더링 한다.
         * @return {KeyboardView}
         */
        render: function() {
            this._detachHandler();
            this._attachHandler();
            return this;
        }
    });


    /**
     * Selection view Class
     * @constructor
     */
    var SelectionView = ne.util.defineClass(Base.View, {
        eventHandler: {
            'mousedown' : '_onMouseDown'
        },
        className: 'infinite_selection_layer',
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
            if (key === 'top') {
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
                list = [];

            ne.util.forEachArray(collectionList, function(collection) {
                list.push(collection.data);
            });
            return list;
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
            var containerPosY = pageY - this.model.offsetTop,
                containerPosX = pageX - this.model.offsetLeft,
                status = {
                    x: 0,
                    y: 0
                };
            if (containerPosY > this.model.height) {
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
            var containerPosY = pageY - this.model.offsetTop,
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
         * @return {SelectionView}
         */
        render: function() {
            this._detachHandler();

            this.$el.css({
                width: '100%'
            });
            this.draw();

            this._attachHandler();
            return this;
        }
    });
