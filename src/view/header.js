/**
 * @fileoverview Header View
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * Header View
 * @constructor Header
 */
var Header = ne.util.defineClass(Base.View, /**@lends Header.prototype */{
    eventHandler: {
        'scroll': '_onScroll'
    },
    className: 'infinite_header_container',
    style: 'overflow:hidden',
    init: function (attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.model.on('change', this._onModelChange, this);
    },
    _template: {
        table: '' +
        '<div class="header">' +
        '<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
        '<colgroup>' +
        '<%=col%>' +
        '</colgroup>' +
        '<tbody>' +
        '<%=tbody%>' +
        '</tbody>' +
        '</div>'
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
        if (key === 'width') {
            this._setContainerWidth(value);
        } else if( key === 'scrollLeft') {
            this.$el[0].scrollLeft = value;
        } else if (key === 'columnWidthList') {
            this._changeColumnWidth(value);
        }
    },
    /**
     * scroll event handler
     *  scroll left 를 동기화 한다.
     * @param {event} scrollEvent 스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        this.model.set({
            scrollLeft: scrollEvent.target.scrollLeft
        });
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
            $colList.eq(index).width(width);
        }, this);
    },
    /**
     * 랜더링 한다.
     * @return {Header}
     */
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        var columnModelList = this.grid.option('columnModelList'),
            tbody = '',
            html,
            height = this.model.headerHeight,
            col = '',
            color = this.grid.option('color');

        ne.util.forEachArray(columnModelList, function() {
            col += '<col></col>';
        }, this);

        tbody += '<tr style="height:' + height + 'px">';
        ne.util.forEachArray(columnModelList, function(columnModel) {
            tbody += '<th columnname="' + columnModel['columnName'] + '">' + columnModel['title'] + '</th>';
        });
        tbody += '</tr>';

        html = Util.template(this._template.table, {
            col: col,
            tbody: tbody
        });

        this.$el.html(html);
        this._setContainerWidth(this.model.width);
        this.$el.find('table').css('background', color['border']);
        this.$el.find('th').css('background', color['th']);
        this._attachHandler();
        return this;
    },
    /**
     * Model 의 변경된 width 값을 받아 container 의 width 를 결정한다.
     * @param {(Number|String)} width 너비값
     * @private
     */
    _setContainerWidth: function(width) {
        if (width === 0) {
            width = '100%';
        } else {
            width = width + 'px';
        }
        this.$el.find('.header:first').css('width', width);
    }
});