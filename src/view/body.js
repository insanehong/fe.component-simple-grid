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
        className: 'infinite_body',
        style: 'position: absolute; top: 0; white-space: nowrap;',
        _template: {
            main: '<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
                '<colgroup>' +
                '<%=col%>' +
                '</colgroup>' +
                '<tbody>' +
                '<%=tbody%>' +
                '</tbody>',
            tr: '<tr ' +
                'key="' +
                '<%=key%>' +
                '"' +
                'style="' +
                'height:<%=height%>px' +
                '"' +
                '>' +
                '<%=content%>' +
                '</tr>',
            td: '<td ' +
                'columnname="<%=columnName%>" ' +
                'style="' +
                'text-align:<%=align%>;' +
                'overflow:hidden;' +
                '"' +
                '>' +
                '<%=content%>' +
                '</td>'
        },
        init: function(attributes) {
            Base.View.prototype.init.apply(this, arguments);
            if (this.grid.option('useSelection')) {
                this.setOwnProperties({
                    selection: attributes.selection
                });
            }
            this.model.on({
                'change' : this._onModelChange,
                'refresh' : this._onRefresh
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
            if (this.selection) {
                this.selection.draw();
            }
        },
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
         * mouseDown
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            if (this.selection) {
                this.selection.attachMouseEvent(mouseDownEvent);
                if (mouseDownEvent.shiftKey) {
                    if (!this.selection.hasSelection()) {
                        this.selection.startSelection();
                    }
                    this.selection.updateSelection();
                } else {
                    this.selection.stopSelection();
                }
            }
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
                this._setContainerWidth(value);
            } else if (key === 'columnWidthList') {
                this._changeColumnWidth(value);
            }
        },
        _changeColumnWidth: function(columnWidthList) {
            var $colList = this.$el.find('colgroup').find('col');
            ne.util.forEachArray(columnWidthList, function(width, index) {
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
         * 랜더링 한다.
         * @return {Body}
         */
        render: function() {
            this._detachHandler();
            this.destroyChildren();

            var list = this.model.list,
                columnModelList = this.grid.option('columnModelList'),
                html,
                height = this.model.rowHeight,
                columnWidthList = this.model.columnWidthList,
                col = '',
                color = this.grid.option('color'),
                trList = [];

            ne.util.forEachArray(columnWidthList, function(width, index) {
                col += '<col style="width:'+ width + 'px"></col>';
            }, this);

            ne.util.forEachArray(list, function(item) {
                var tdList = [];
                ne.util.forEachArray(columnModelList, function(columnModel) {
                    var td,
                        columnName = columnModel['columnName'],
                        content;

                    if (ne.util.isFunction(columnModel.formatter)) {
                        content = columnModel.formatter(item.data[columnName], item.data);
                    } else {
                        content = item.data[columnName];
                    }
                    td = Util.template(this._template.td, {
                        columnName: columnName,
                        align: columnModel['align'],
                        content: content
                    });
                    tdList.push(td);
                }, this);

                trList.push(Util.template(this._template.tr, {
                    height: height,
                    key: item.id,
                    content: tdList.join('')
                }));
            }, this);
            html = Util.template(this._template.main, {
                col: col,
                tbody: trList.join('')
            });
            this.$el.html(html);
            this._setContainerWidth(this.model.width);
            this.$el.find('table').css('background', color['border']);
            this.$el.find('tr').css('background', color['td']);
            this.selection && this.selection.draw();
            this._attachHandler();
            return this;
        },
        _setContainerWidth: function(width) {
            if (width === 0) {
                width = '100%';
            } else {
                width = width + 'px';
            }
            this.$el.css('width', width);
        }
    });
