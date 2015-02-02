/**
 * @fileoverview Header View
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * Header View
 * @constructor Header
 */
var Header = ne.util.defineClass(Base.View, /**@lends Header.prototype */{
    className: 'infinite_header_container',
    style: 'overflow:hidden;position: relative;',
    /**
     * 생성자
     * @param {Object} attributes
     */
    init: function (attributes){
        Base.View.prototype.init.apply(this, arguments);
        this.model.on('change', this._onModelChange, this);
        this.setOwnProperties({
            resizeHandler: null
        });
    },
    _template: {
        table: '' +
        '<div class="infinite_header">' +
        '<table width="100%" border="0" cellpadding="0" cellspacing="' +
        '<%=border%>' +
        '" ' +
        'style="' +
        'table-layout:fixed;' +
        '"' +
        '>' +
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
        } else if (key === 'scrollLeft') {
            this.$el[0].scrollLeft = value;
        } else if (key === 'columnWidthList') {
            this._changeColumnWidth(value);
        }
    },

    /**
     * Model Change 이벤트 핸들러로부터 columnWidthList 를 전달받아, 현재 table의
     * 각 열의 너비를 조정한다.
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
            border = this.grid.option('border'),
            tbody = '',
            html,
            height = this.model.headerHeight,
            col = '',
            color = this.grid.option('color'),
            resizeHandler;

        ne.util.forEachArray(columnModelList, function() {
            col += '<col></col>';
        }, this);

        tbody += '<tr style="height:' + height + 'px">';
        ne.util.forEachArray(columnModelList, function(columnModel) {
            tbody += '<th columnname="' + columnModel['columnName'] + '" style="' +
            'overflow:hidden;white-space:nowrap;*white-space:pre;text-align:center;padding:0;border:0;' +
            '">' + columnModel['title'] + '</th>';
        });
        tbody += '</tr>';

        html = Util.template(this._template.table, {
            border: border,
            col: col,
            tbody: tbody
        });

        this.$el.html(html);
        this._setContainerWidth(this.model.width);
        this.$el.find('table').css('background', color['border']);
        this.$el.find('th').css('background', color['th']);

        if (border === 0) {
            this.$el.css('border', 'solid 1px ' + color['border']);
            this.$el.css('border-bottom', '0px');
        }
        //resize 를 사용한다면 resize handler 를 추가한다.
        if (this.grid.option('useColumnResize')) {
            this.resizeHandler = this.createView(ResizeHandlerContainer, {
                grid: this.grid,
                model: this.model,
                height: height
            });
            this.$el.append(this.resizeHandler.render().el);
        }
        if (!this.grid.option('hasHeader')) {
            this.$el.css({
                height: '0px',
                width: '0px',
                border: 0
            });
        }
        this._attachHandler();
        return this;
    },

    /**
     * Model 의 변경된 width 값을 받아 container 의 width 를 결정한다.
     * @param {(Number|String)} width 너비값
     * @private
     */
    _setContainerWidth: function(width) {
        //spacer 만큼 너비를 계산하여 padding 을 설정한다.
        var padding = this.grid.option('border') * 6 + this.grid.scrollBarSize;

        if (width === 0) {
            width = '100%';
        } else {
            width = width + 'px';
        }
        this.$el.find('.infinite_header:first').css({
            'width': width,
            'paddingRight': padding + 'px'
        });
    }
});
