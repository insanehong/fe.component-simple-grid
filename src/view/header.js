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
        main: '' +
        '<div class="header">' +
        '<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
        '<colgroup>' +
        '<%=col%>' +
        '</colgroup>' +
        '<tbody>' +
        '<%=tbody%>' +
        '</tbody>' +
        '</div>',
        col: '' +
        '<col ' +
        'width="<%=width%>"' +
        '>'
    },
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'width') {
            this.$el.find('.header:first').width(value);
        } else if( key === 'scrollLeft') {
            this.$el[0].scrollLeft = value;
        } else if (key === 'columnWidthList') {
            this._changeColumnWidth(value);
        }
    },
    _onScroll: function(scrollEvent) {
        this.model.set({
            scrollLeft: scrollEvent.target.scrollLeft
        });
    },
    _changeColumnWidth: function(columnWidthList) {
        var $colList = this.$el.find('colgroup').find('col');
        ne.util.forEachArray(columnWidthList, function(width, index) {
            $colList.eq(index).width(width);
        }, this);
    },
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        var columnModelList = this.grid.option('columnModelList'),
            tbody = '',
            html,
            height = this.model.rowHeight,
            col = '',
            color = this.grid.option('color');

        ne.util.forEachArray(columnModelList, function(columnModel) {
            var width = columnModel.width || '';
            col += Util.template(this._template.col, {
                width: width
            });
        }, this);



        tbody += '<tr style="height:' + height + 'px">';
        ne.util.forEachArray(columnModelList, function(columnModel) {
            tbody += '<th columnname="' + columnModel['columnName'] + '">' + columnModel['title'] + '</th>';
        });
        tbody += '</tr>';


        html = Util.template(this._template.main, {
            col: col,
            tbody: tbody
        });

        this.$el.html(html);
        this.$el.find('table').css('background', color['border']);
        this.$el.find('th').css('background', color['th']);
        this._attachHandler();
        return this;
    }
});