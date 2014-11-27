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
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        var list = this.model.list,
            columnModelList = this.grid.option('columnModelList'),
            html = '',
            tbody = '',
            height = this.model.lineHeight - 1,
            col = '';

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
        this._attachHandler();
        return this;
    }
});