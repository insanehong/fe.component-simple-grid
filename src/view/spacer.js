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
     * @return {Spacer}
     */
    render: function() {
        var color = this.grid.option('color'),
            height = this.grid.option('headerHeight');
        this._detachHandler();
        this.destroyChildren();
        this.$el.css({
            background: color['th'],
            border: 'solid 1px ' + color['border'],
            height: height + 'px'
        });
        this._attachHandler();
        return this;
    }
});