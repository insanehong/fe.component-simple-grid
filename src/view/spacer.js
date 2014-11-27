/**
 * @fileoverview Spacer View
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * Spacer View
 * @constructor Spacer
 */
var Spacer = ne.util.defineClass(Base.View, /**@lends Spacer.prototype */{
    eventHandler: {
    },
    className: 'infinite_spacer',
    init: function (attributes) {
        Base.View.prototype.init.apply(this, arguments);
    },
    render: function() {
        this._detachHandler();
        this.destroyChildren();
        this.$el.css('height', this.grid.option('headerHeight'));
        this._attachHandler();
        return this;
    }
});