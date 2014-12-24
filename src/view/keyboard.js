/**
 * @fileoverview Key 입력을 담당하는 파일
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
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
