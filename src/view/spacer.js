/**
 * @fileoverview 테이블 헤더의 우측 영역(Scroll) 에 자리하는 Spacer View
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * Spacer View
 * 테이블 헤더의 우측 영역(Scroll) 에 자리하는 Spacer View
 * @constructor Spacer
 */
var Spacer = ne.util.defineClass(Base.View, /**@lends Spacer.prototype */{
    eventHandler: {},
    className: 'infinite_spacer',
    style: 'display: block;	position: absolute;	top: 0;	right: 0; width: 16px;',
    init: function (attributes) {
        Base.View.prototype.init.apply(this, arguments);
    },
    /**
     * 렌더링 한다.
     * @returns {Spacer}
     */
    render: function() {
        var grid = this.grid,
            color = grid.option('color'),
            height = grid.option('headerHeight'),
            border = grid.option('border'),
            top = border ? 0 : 1,
            right = border ? 0 : 1,
            width = 17 - border,
            css = {
                top: top + 'px',
                right: right + 'px',
                background: color['th'],
                height: height + 'px',
                width: width + 'px',
                border: 'solid ' + border + 'px ' + color['border']
            };

        this._detachHandler();
        this.destroyChildren();
        this.$el.css(css);
        this._attachHandler();
        return this;
    }
});