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
    },
    className: 'infinite_header',
    init: function (attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.model.on('change', this._onModelChange, this);
    },
    _template: {
        main: '<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
        '<colgroup>' +
        '<%=col%>' +
        '</colgroup>' +
        '<tbody>' +
        '<%=tbody%>' +
        '</tbody>',
        col: '' +
        '<col style="width: ' +
        '<%=width%>px">'
    },
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'top') {
            this.$el.css('top', value + 'px');
        } else if (key === 'width') {
            this.$el.width(value);
        }
    },
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        var columnModelList = this.grid.option('columnModelList'),
            tbody = '',
            height = this.model.lineHeight,
            col = '',
            color = this.grid.option('color');

        ne.util.forEachArray(columnModelList, function() {
            col += '<col>' +
            '</col>';
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