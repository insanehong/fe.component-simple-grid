/**
 * @fileoverview 가상 스크롤바
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
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
            var right = (this.grid.option('border') === 0) ? 1 : 0,
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
                height: this.grid.option('scrollX') ? this.model.height + this.grid.scrollBarSize : this.model.height,
                top: top,
                right: right
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

            if (this.grid.option('scrollX')) {
                height += this.grid.scrollBarSize;
            }

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
