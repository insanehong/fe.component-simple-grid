/**
 * @fileoverview Spacer View
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * Spacer View
 * @constructor Spacer
 */
var Spacer = ne.util.defineClass(Base.View, /**@lends Spacer.prototype */{
    eventHandler: {},
    className: 'infinite_spacer',
    style: 'display: block;	position: absolute;	top: 0;	right: 0; width: 16px;',
    init: function (attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.model.on({
            'change' : this._onModelChange
        }, this);
    },
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;

        if (key === 'headerHeight') {
            value -= 2;
            this.$el.css('height', value + 'px');
        }
    },
    render: function() {
        var color = this.grid.option('color');
        this._detachHandler();
        this.destroyChildren();
        this.$el.css({
            background: color['th'],
            border: 'solid 1px ' + color['border']
        });
        this._attachHandler();
        return this;
    }
});