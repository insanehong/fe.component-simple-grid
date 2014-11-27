    /**
     * @fileoverview 원본 Data를 한번 가공하여 View 에서 사용할 수 있는 데이터 구조를 담고 있는 클래스 모음
     * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
     */
    /**
     * View 에서 참조하여 rendering 하도록, 원본 데이터를 가공한 render model
     * @constructor Model
     */
    var Model = ne.util.defineClass(Base, /**@lends Model.prototype */{
        init: function(attributes) {
            Base.prototype.init.apply(this, arguments);
            this._initializeVariables();
            this._setHeight();
            this.collection.on({
                'change' : this._onCollectionChange
            }, this);
            this.on({
                'change' : this._onChange
            }, this);
        },
        /**
         * 변수를 초기화한다.
         * @private
         */
        _initializeVariables: function() {
            this.setOwnProperties({
                collection: new Collection(),          //원본 데이터 collection
                offsetTop: 0,
                offsetLeft: 0,
                width: 0,
                height: 0,
                containerHeight: 0,
                containerWidth: 0,
                stopChangeEvent: false,
                freeze: false,
                lineHeight: this.grid.option('lineHeight') || 0,
                scrollTop: 0,
                scrollLeft: 0,
                maxScrollTop: 0,
                startIdx: 0,
                endIdx: 0,
                top: 0,
                list: [],
                hiddenLineCount: 10,   //스마트 랜더링시 한번에 랜더링할 숨겨진 행의 개수 (상단, 하단 각각의 행 개수)
                criticalPoint: 3       //스크롤 시 숨겨진 행의 개수가 criticalPoint 만큼 남았다면 다음 페이지 랜더링을 시도 한다.
            });
        },
        /**
         * 변수를 리셋 한다.
         * @private
         */
        _resetVariables: function() {
            this.set({
                stopChangeEvent: false,
                freeze: false,
                lineHeight: this.grid.option('lineHeight') || 0,
                scrollTop: 0,
                scrollLeft: 0,
                maxScrollTop: 0,
                startIdx: 0,
                endIdx: 0,
                top: 0,
                list: [],
                width: this.containerWidth - this.grid.scrollBarSize
            });
        },
        /**
         * 원본 데이터 collection 이 변경 되었을 경우 이벤트 핸들러
         * @param {event} changeEvent
         * @private
         */
        _onCollectionChange: function(changeEvent) {
            var type = changeEvent.type;
            this.stopChangeEvent = true;

            switch (type) {
                case 'clear':
                    this._resetVariables();
                    this._refresh();
                    break;
                case 'prepend':
                    this._doFreeze(changeEvent.prepended);
                    this._refresh();
                    break;
                case 'set':
                    this._refresh();
                    break;
                case 'append':
                    this._refresh();
                    break;
                default :
                    break;
            }
            this.stopChangeEvent = false;
            this._fireChangeEvents({
                top: this.top,
                list: this.list,
                scrollTop: this.scrollTop
            });
        },
        /**
         * 한번에 여러 change event 를 발생한다.
         * @param {object} dataSets
         * @private
         */
        _fireChangeEvents: function(dataSets) {
            ne.util.forEach(dataSets, function(value, key) {
                this.invoke('change', {
                    key: key,
                    value: value
                });
            }, this);
        },
        /**
         * 자기 스스로에 대한 onChange 이벤트 핸들러
         * @param {event} changeEvent
         * @private
         */
        _onChange: function(changeEvent) {
            var key = changeEvent.key,
                value = changeEvent.value;

            switch (key) {
                case 'scrollTop':
                    this._onScrollTopChange(value);
                    break;
                case 'scrollLeft':
                    this._onScrollLeftChange(value);
                    break;
                case 'lineHeight':
                case 'containerHeight':
                    this.collection.maxLength = this._getMaxCollectionLength();
                    break;
            }
        },
        /**
         * scrollLeft 값이 변경되었을 때 scrollLeft 값 관련 처리
         * @param {number} value
         * @private
         */
        _onScrollLeftChange: function(value) {
            if (value < 0) {
                this.set('scrollLeft', 0);
            }
        },
        /**
         * scrollTop 이 변경되었을 때 rendering 관련 처리
         * @param {number} value
         * @private
         */
        _onScrollTopChange: function(value) {
            if (this.maxScrollTop < value) {
                this.set('scrollTop', this.maxScrollTop, {silent: true});
            }else if (value < 0) {
                this.set('scrollTop', 0, {silent: true});
            }else {
                if (this._isRenderable()) {
                    this._refresh();
                }
            }
        },
        /**
         * IE 에서 div height max 제한으로 인해 maxCollection length 를 반환한다.
         * @private
         */
        _getMaxCollectionLength: function() {
            if (ne.util.browser.msie) {
                //1533917 is the max height of IE (66692*23 + 1)
                return Math.floor(1533900 / this.lineHeight);
            } else {
                return 0;
            }
        },
        /**
         * max grid top 값을 반환한다.
         * @return {number}
         */
        getMaxScrollTop: function() {
            var maxScrollTop = this.lineHeight * (this.collection.length) - this.containerHeight;
            if (this.grid.option('scrollX')) {
                maxScrollTop += this.grid.scrollBarSize;
            }
            return Math.max(maxScrollTop, 0);
        },
        /**
         * 값을 설정한다.
         * @param {number|string} key
         * @param {*} value
         * @param {object} [options]
         */
        set: function(key, value, options) {
            if (typeof key === 'object') {
                ne.util.forEach(key, function(val, key) {
                    this.set(key, val, value);
                }, this);
            }else {
                if (this[key] != value) {
                    this[key] = value;

                    if (!(options && options.silent) && !this.stopChangeEvent) {
                        this.invoke('change', {
                            key: key,
                            value: value
                        });
                    }
                }
            }
        },
        /**
         * 높이를 계산하여 설정한다.
         * @private
         */
        _setHeight: function() {
            var height = this.grid.option('lineHeight') * this.grid.option('displayCount');
            this.set('height', height);
        },
        /**
         * rendering 시 필요한 데이터를 갱신한다.
         * @private
         */
        _refresh: function() {
            var renderData = this._getRenderingData(),
                list = this.collection.list.slice(renderData.startIdx, renderData.endIdx);

            this.set({
                startIdx: renderData.startIdx,
                endIdx: renderData.endIdx,
                list: list,
                top: renderData.top
            });

            this.invoke('refresh');
        },
        /**
         * 인자로 넘어온 list 데이터가 화면에 출력되었을 때 높이를 계산한다.
         * @param {Array} list
         * @return {number}
         * @private
         */
        _getDataHeight: function(list) {
            return list.length * this.lineHeight;
        },
        /**
         * 옵션값에 scroll fix 가 설정되어 있다면, scroll fix 한다.
         * @param {Array} list
         * @private
         */
        _doFreeze: function(list) {
            if (this.freeze || (this.grid.option('freeze') && this.scrollTop !== 0)) {
                var dataHeight = this._getDataHeight(list);
                this.set('maxScrollTop', this.getMaxScrollTop());
                this.set('scrollTop', this.scrollTop + dataHeight);
            }
        },
        /**
         * 렌더링 데이터를 반환한다.
         * @return {{top: number, startIdx: *, endIdx: *}}
         * @private
         */
        _getRenderingData: function() {
            var top,
                scrollTop = this.scrollTop,
                lineHeight = this.lineHeight,
                displayCount = this.grid.option('displayCount'),
                startIdx = Math.max(0, Math.ceil(scrollTop / lineHeight) - this.hiddenLineCount),
                endIdx = Math.min(this.collection.length,
                    Math.floor(startIdx + this.hiddenLineCount + displayCount + this.hiddenLineCount));

            top = (startIdx === 0) ? 0 : startIdx * this.lineHeight;
            return {
                top: top,
                startIdx: startIdx,
                endIdx: endIdx
            };
        },
        /**
         * grid 되었을 시 숨겨진 행의 개수가 critical point 보다 적게 남아있는지를 확인하여 rendering 할지 여부를 결정한다.
         * @return {boolean}
         * @private
         */
        _isRenderable: function() {
             var scrollTop = this.scrollTop,
                lineHeight = this.lineHeight,
                height = this.height,
                displayCount = this.grid.option('displayCount'),
                lineCount = this.collection.length,
                displayStartIdx = Math.max(0, Math.ceil(scrollTop / (lineHeight))),
                displayEndIdx = Math.min(lineCount - 1, Math.floor((scrollTop + height) / (lineHeight))),
                startIdx = Math.max(0, this.startIdx),
                endIdx = Math.min(lineCount, this.endIdx);

            //시작 지점이 임계점 이하로 올라갈 경우 return true
            if (startIdx !== 0) {
                if (startIdx + this.criticalPoint > displayStartIdx) {
                    return true;
                }
            }

            //마지막 지점이 임계점 이하로 내려갔을 경우 return true
           if (endIdx !== lineCount) {
                if (endIdx - this.criticalPoint < displayEndIdx) {
                    return true;
                }
            }
            return false;
        }
    });
