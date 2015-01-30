    /**
     * @fileoverview 원본 Data를 한번 가공하여 View 에서 사용할 수 있는 데이터 구조를 담고 있는 클래스 모음
     * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
     */
    /**
     * View 에서 참조하여 rendering 하도록, 원본 데이터를 가공한 render model
     * @constructor Model
     */
    var Model = ne.util.defineClass(Base, /**@lends Model.prototype */{
        /**
         * 생성자
         * @param attributes
         */
        init: function(attributes) {
            Base.prototype.init.apply(this, arguments);
            this._initializeVariables();
            this._setHeight();
            this.collection.on({
                'change': this._onCollectionChange
            }, this);
            this.on({
                'change': this._onChange
            }, this);
            this._calculateColumnWidthList();
        },

        /**
         * 인스턴스 생성시 변수를 초기화한다.
         * @private
         */
        _initializeVariables: function() {
            this.setOwnProperties({
                collection: new Collection({grid: this.grid}),          //원본 데이터 collection
                offsetTop: 0,
                offsetLeft: 0,
                width: 0,
                height: 0,
                minimumColumnWidth: this.grid.option('minimumColumnWidth'),
                headerHeight: this.grid.option('headerHeight'),
                containerHeight: 0,
                containerWidth: 0,
                stopChangeEvent: false,
                freeze: false,
                rowHeight: this.grid.option('rowHeight') || 0,
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
         * clear 시 변수를 리셋 한다.
         * @private
         */
        _resetVariables: function() {
            this.set({
                stopChangeEvent: false,
                freeze: false,
                headerHeight: this.grid.option('headerHeight'),
                rowHeight: this.grid.option('rowHeight') || 0,
                scrollTop: 0,
                scrollLeft: 0,
                maxScrollTop: 0,
                startIdx: 0,
                endIdx: 0,
                top: 0,
                list: []
            });
        },

        /**
         * 원본 데이터 collection 이 변경 되었을 경우 이벤트 핸들러
         * @param {Object} changeEvent Collection 에서 발생한 Change 이벤트
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
                case 'remove':
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
         * @param {object} dataSets 이벤트 데이터 Key-Value 데이터 쌍
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
         * @param {{key: key, value: value}} changeEvent 자기 자신이 발생하는 Change 이벤트 핸들러
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
                case 'rowHeight':
                    this.collection.maxLength = this._getMaxCollectionLength();
                    break;
                case 'containerHeight':
                    this.collection.maxLength = this._getMaxCollectionLength();
                    break;
                case 'containerWidth':
                    this._calculateColumnWidthList();
                    break;
            }
        },

        /**
         * scrollLeft 값이 변경되었을 때 scrollLeft 값 관련 처리
         * @param {number} value 변경된 scrollLeft 값
         * @private
         */
        _onScrollLeftChange: function(value) {
            if (value < 0) {
                this.set('scrollLeft', 0);
            }
        },

        /**
         * scrollTop 이 변경되었을 때 rendering 관련 처리
         * @param {number} value 변경된 scrollTop 값
         * @private
         */
        _onScrollTopChange: function(value) {
            if (this.maxScrollTop < value) {
                this.set('scrollTop', this.maxScrollTop, {silent: true});
            } else if (value < 0) {
                this.set('scrollTop', 0, {silent: true});
            } else {
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
            var border = +this.grid.option('border') || 0;

            if (ne.util.browser.msie) {
                //1533917 is the max height of IE (66692*23 + 1)
                return Math.floor(this.grid.ieMaxHeight / (this.rowHeight + border));
            } else {
                return 0;
            }
        },

        /**
         * maxScrollTop 값을 계산하여 반환한다.
         * @return {number} maxScrollTop 값
         */
        getMaxScrollTop: function() {
            var border = this.grid.option('border'),
                maxScrollTop = Util.getHeight(this.collection.length, this.rowHeight, border) - this.containerHeight;

            if (this.grid.option('scrollX')) {
                maxScrollTop += this.grid.scrollBarSize;
            }

            return Math.max(maxScrollTop, 0);
        },

        /**
         * 값을 설정한다.
         * @param {*} key   키값. Object 형태로 들어올 경우, {key1: value1, key2: value2} 와 같이 다수의 키값을 설정할 수 있다.
         * @param {*} [value] 키에 할당할 값. 첫번째 파라미터에 Object 타입으로 인자를 넘겨주었을 경우 무시된다.
         * @param {{silent: boolean}} [options] silent 값이 true 일 경우 이벤트를 발생하지 않는다.
         */
        set: function(key, value, options) {
            if (ne.util.isObject(key)) {
                ne.util.forEach(key, function(val, key) {
                    this.set(key, val, value);
                }, this);
            } else {
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
            var height;

            if (ne.util.isExisty(this.grid.option('height'))) {
                height = this.grid.option('height');
                if (this.grid.option('scrollX')) {
                    height -= this.grid.scrollBarSize;
                }
            } else {
                height = Util.getHeight(this.grid.option('displayCount'), this.grid.option('rowHeight'), this.grid.option('border'));
            }

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
         * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
         * @param {Number} index    너비를 변경할 컬럼의 인덱스
         * @param {Number} width    변경할 너비 pixel값
         */
        setColumnWidth: function(index, width) {
            width = Math.max(width, this.minimumColumnWidth);

            var curColumnWidthList = ne.util.extend([], this.columnWidthList);

            if (!ne.util.isUndefined(curColumnWidthList[index])) {
                curColumnWidthList[index] = width;
                this._calculateColumnWidthList(curColumnWidthList);
            }
        },

        /**
         * columnWidthList 를 계산하여 저장한다.
         * @private
         */
        _calculateColumnWidthList: function(columnWidthList) {
            columnWidthList = columnWidthList || [];
            var columnModelList = this.grid.option('columnModelList'),
                defaultColumnWidth = this.grid.option('defaultColumnWidth'),
                minimumColumnWidth = this.grid.option('minimumColumnWidth'),
                border = this.grid.option('border'),
                frameWidth = this.containerWidth - this.grid.scrollBarSize,
                currentWidth = 0,
                unassignedCount = 0,
                unassignedWidth,
                remainWidth,
                diff;

            if (!columnWidthList.length) {
                ne.util.forEachArray(columnModelList, function(columnModel) {
                    var width = ne.util.isUndefined(columnModel['width']) ? -1 : Math.max(minimumColumnWidth, columnModel['width']);
                    //% 경우 처리
                    if (ne.util.isString(width) && width.indexOf('%')) {
                        width = width.replace('%', '');
                        width = Math.floor(frameWidth * (width / 100));
                    }

                    columnWidthList.push(width);
                }, this);
            }

            ne.util.forEachArray(columnWidthList, function(width) {
                if (width > 0) {
                    width = Math.max(minimumColumnWidth, width);
                    currentWidth += width + border;
                } else {
                    unassignedCount++;
                }
            }, this);
            currentWidth += border;

            remainWidth = frameWidth - currentWidth;
            unassignedWidth = Math.max(minimumColumnWidth, Math.floor(remainWidth / unassignedCount) - border);

            //할당되지 않은 column 할당함
            ne.util.forEachArray(columnWidthList, function(width, index) {
                if (width === -1) {
                    columnWidthList[index] = unassignedWidth;
                    currentWidth += unassignedWidth + border;
                }
            });

            remainWidth = frameWidth - currentWidth;

            if (remainWidth < 0) {
                frameWidth += Math.abs(remainWidth);
            }
            this.set({
                width: frameWidth,
                columnWidthList: columnWidthList
            });
        },

        /**
         * 인자로 넘어온 list 데이터가 화면에 출력되었을 때 높이를 계산한다.
         * @param {Array} list  인자로 넘어온 list 데이터
         * @return {number} 계산된 높이값
         * @private
         */
        _getDataHeight: function(list) {
            var border = this.grid.option('border');
            return Util.getHeight(list.length, this.rowHeight, border);
        },

        /**
         * 옵션값에 scroll fix 가 설정되어 있다면, scroll fix 한다.
         * @param {Array} list  scrollFix 를 위한 높이 계산 시 사용될 prepend 된 data의 list
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
                border = this.grid.option('border'),
                scrollTop = this.scrollTop,
                rowHeight = this.rowHeight,
                displayCount = this.grid.option('displayCount'),
                startIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + border)) - this.hiddenLineCount),
                endIdx = Math.min(this.collection.length,
                    Math.floor(startIdx + this.hiddenLineCount + displayCount + this.hiddenLineCount));

            top = (startIdx === 0) ? 0 : Util.getHeight(startIdx, rowHeight, border) - border;

            return {
                top: top,
                startIdx: startIdx,
                endIdx: endIdx
            };
        },

        /**
         * grid 되었을 시 숨겨진 행의 개수가 critical point 보다 적게 남아있는지를 확인하여 rendering 할지 여부를 결정한다.
         * @return {boolean}    랜더링 여부
         * @private
         */
        _isRenderable: function() {
             var border = this.grid.option('border'),
                 scrollTop = this.scrollTop,
                 rowHeight = this.rowHeight,
                 height = this.height,
                 displayCount = this.grid.option('displayCount'),
                 rowCount = this.collection.length,
                 displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + border))),
                 displayEndIdx = Math.min(rowCount - 1, Math.floor((scrollTop + height) / (rowHeight + border))),
                 startIdx = Math.max(0, this.startIdx),
                 endIdx = Math.min(rowCount, this.endIdx);

            //시작 지점이 임계점 이하로 올라갈 경우 return true
            if (startIdx !== 0) {
                if (startIdx + this.criticalPoint > displayStartIdx) {
                    return true;
                }
            }

            //마지막 지점이 임계점 이하로 내려갔을 경우 return true
           if (endIdx !== rowCount) {
                if (endIdx - this.criticalPoint < displayEndIdx) {
                    return true;
                }
            }
            return false;
        }
    });
