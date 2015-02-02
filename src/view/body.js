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
            'mousedown': '_onMouseDown',
            'click': '_onClick'
        },
        padding: 10,
        className: 'infinite_body',
        style: 'position: absolute; top: 0; white-space: nowrap;',
        _template: {
            table: '<table width="100%" border="0" cellpadding="0" ' +
                'cellspacing="' +
                '<%=border%>' +
                '" ' +
                'bgcolor="' +
                '<%=color%>' +
                '" ' +
                'class="' +
                '<%=className%>' +
                '" ' +
                'style="' +
                'table-layout:fixed' +
                '"' +
                '>' +
                '<colgroup>' +
                '<%=col%>' +
                '</colgroup>' +
                '<tbody>' +
                '<%=tbody%>' +
                '</tbody>',
            tr: '<tr ' +
                'key="' +
                '<%=key%>' +
                '" ' +
                'style="' +
                'height:<%=height%>px;' +
                'background:<%=color%>;' +
                '" ' +
                'class="' +
                '<%=className%>' +
                '" ' +
                '>' +
                '<%=content%>' +
                '</tr>',
            td: '<td ' +
                'columnname="<%=columnName%>" ' +
                'style="' +
                'text-align:<%=align%>;' +
                'overflow:hidden;padding:0 <%=padding%>px;*padding:0 ' +
                '<%=padding%>px;border:0;white-space:nowrap;*white-space:pre;' +
                '" ' +
                'class="' +
                '<%=className%>' +
                '" ' +
                '<%=attributes%>' +
                '>' +
                '<%=content%>' +
                '</td>'
        },

        /**
         * 생성자 함수
         * @param {object} attributes
         * @param   {object} attributes.selection 셀렉션 view 인스턴스
         */
        init: function(attributes) {
            Base.View.prototype.init.apply(this, arguments);

            if (this.grid.option('useSelection')) {
                this.setOwnProperties({
                    selection: attributes.selection
                });
            }

            this.setOwnProperties({
                resizeHandler: null,
                isIe7: !!(ne.util.browser.msie && ne.util.browser.version === 7)
            });

            this.grid.focusModel.on('select', this.select, this);
            this.grid.focusModel.on('unselect', this.unselect, this);

            this.model.on({
                'change': this._onModelChange,
                'refresh': this._onRefresh
            }, this);

            this.grid.view.container.on({
                'scroll': this._onScroll
            }, this);
        },

        /**
         * 디자인 클래스를 unselect 한다.
         * @param {(Number|String)} key select 된 해당 row 의 key
         * @param {Object} [selectMap] focusModel 에서 이벤트 발생시 전달되는 selectMap 오브젝트
         */
        select: function(key, selectMap) {
            var $tr = this.$el.find('tr[key="' + key + '"]');

            $tr.length && $tr.css('background', '').addClass('selected');
        },

        /**
         * 디자인 클래스 unselect 한다.
         * @param {(Number|String)} key unselect 된 해당 row 의 key
         * @param {Object} [selectMap] focusModel 에서 이벤트 발생시 전달되는 selectMap 오브젝트
         */
        unselect: function(key, selectMap) {
            var $tr = this.$el.find('tr[key="' + key + '"]'),
                color = this.grid.option('color');
            $tr.length && $tr.removeClass('selected').css('background', color['td']);
        },

        /**
         * 스크롤 이벤트 핸들러
         * @private
         */
        _onScroll: function() {
            if (this.selection) {
                this.selection.draw();
            }
        },

        /**
         * click 이벤트 핸들러
         * @param {event} clickEvent 클릭이벤트
         * @private
         */
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target),
                columnName = $target.closest('td').attr('columnname'),
                rowKey = $target.closest('tr').attr('key'),
                customEvent = {
                    $target: $target,
                    rowKey: rowKey,
                    columnName: columnName
                };

            this.fire('click', customEvent);
        },

        /**
         * mouseDown 이벤트 핸들러
         * @param {event} mouseDownEvent 마우스다운 이벤트
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target),
                rowKey = $target.closest('tr').attr('key'),
                selection = this.selection;

            this.grid.focusModel.select(rowKey);
            if (selection) {
                selection.attachMouseEvent(mouseDownEvent);
                if (mouseDownEvent.shiftKey) {
                    if (!selection.hasSelection()) {
                        selection.startSelection();
                    }
                    selection.updateSelection();
                } else {
                    selection.stopSelection();
                }
            }
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
            if (key === 'top') {
                this.$el.css('top', value + 'px');
            } else if (key === 'width') {
                this._setContainerWidth(value);
            } else if (key === 'columnWidthList') {
                this._changeColumnWidth(value);
            }
        },

        /**
         * Model Change 이벤트 핸들러로부터 columnWidthList 를 전달받아, 현재 table의
         * 각 열의 높이를 조정한다.
         * @param {Array} columnWidthList 컬럼 너비 리스트
         * @private
         */
        _changeColumnWidth: function(columnWidthList) {
            var $colList = this.$el.find('colgroup').find('col');

            ne.util.forEachArray(columnWidthList, function(width, index) {
                if (this.isIe7) {
                    width -= this.padding * 2;
                }
                $colList.eq(index).css('width', width + 'px');
            }, this);
        },

        /**
         * model 의 refresh 이벤트가 발생했을 때 이벤트 핸들러
         * @private
         */
        _onRefresh: function() {
            this.render();
        },

        /**
         * <colgroup> 내 들어갈 마크업 문자열을 생성한다.
         * @param {Array} columnWidthList   컬럼 너비 정보 리스트
         * @return {string} 마크업 문자열
         * @private
         */
        _getColGroupMarkup: function(columnWidthList) {
            var col = '';

            ne.util.forEachArray(columnWidthList, function(width) {
                if (this.isIe7) {
                    width -= this.padding * 2;
                }
                col += '<col style="width:' + width + 'px"></col>';
            }, this);
            return col;
        },

        /**
         * <tbody> 내 들어갈 마크업 문자열을 생성한다.
         * @return {string} 생성된 마크업 문자열
         * @private
         */
        _getTbodyMarkup: function() {
            var list = this.model.list,
                columnModelList = this.grid.option('columnModelList'),
                color = this.grid.option('color'),
                trList = [],
                className = this.grid.option('className');

            //각 tr의 마크업을 생성한다.
            ne.util.forEachArray(list, function(item) {
                var tdList = [],
                    height = this.model.rowHeight,
                    colSpanBy = item.data['_colSpanBy'],
                    length = columnModelList.length,
                    attributes = ne.util.isExisty(colSpanBy) ? 'colspan="' + length + '"' : '';
                //각 TD의 마크업을 생성한다.
                ne.util.forEachArray(columnModelList, function(columnModel) {
                    var td,
                        columnName = columnModel['columnName'],
                        content;
                    //Colspan 이 있으면 해당하는 TD의 마크업만 생성하고, 없다면 전체 TD 마크업을 생성한다.
                    if (!ne.util.isExisty(colSpanBy) || colSpanBy === columnName) {
                        if (ne.util.isFunction(columnModel.formatter)) {
                            content = columnModel.formatter(item.data[columnName], item.data);
                        } else {
                            content = item.data[columnName];
                        }
                        td = Util.template(this._template.td, {
                            className: className.td,
                            columnName: columnName,
                            align: columnModel['align'],
                            padding: this.padding,
                            content: content,
                            attributes: attributes
                        });
                        tdList.push(td);
                    }
                }, this);

                trList.push(Util.template(this._template.tr, {
                    className: className.tr,
                    color: color['td'],
                    height: height,
                    key: item.id,
                    content: tdList.join('')
                }));
            }, this);
            return trList.join('');
        },

        /**
         * 랜더링 한다.
         * @return {Body}
         */
        render: function() {
            this._detachHandler();
            this.destroyChildren();

            var columnWidthList = this.model.columnWidthList,
                color = this.grid.option('color'),
                border = this.grid.option('border'),
                selectList = this.grid.focusModel.getSelectList(),
                className = this.grid.option('className'),
                resizeHandler;

            this.$el.html(Util.template(this._template.table, {
                className: className.table,
                border: border,
                color: border ? color['border'] : '',
                col: this._getColGroupMarkup(columnWidthList),
                tbody: this._getTbodyMarkup()
            }));

            this._setContainerWidth(Math.ceil(this.model.width));
            ne.util.forEachArray(selectList, function(key) {
                this.select(key);
            }, this);

            if (this.selection) {
                this.selection.draw();
            }

            //resize 를 사용한다면 resize handler 를 추가한다.
            if (this.grid.option('useColumnResize')) {
                this.resizeHandler = this.createView(ResizeHandlerContainer, {
                    grid: this.grid,
                    model: this.model,
                    height: this.$el.height()
                });
                this.$el.append(this.resizeHandler.render().el);
            }

            this._attachHandler();

            return this;
        },

        /**
         * Container 의 width 를 설정한다.
         * @param {Number} width 너비값
         * @private
         */
        _setContainerWidth: function(width) {
            if (width === 0) {
                width = '100%';
            } else {
                width = width + 'px';
            }
            this.$el.css('width', width);
        }
    });
