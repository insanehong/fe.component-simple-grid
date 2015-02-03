/**
 * @fileoverview Container 뷰
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Container View
 * @constructor Container
 */
var Container = ne.util.defineClass(Base.View, /**@lends Container.prototype */{
    className: 'infinite_container',
    eventHandler: {
        'scroll': '_onScroll'
    },
    style: 'position: relative;',
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);

        this.model.on({
            'change': this._onModelChange
        }, this);
        this._initializeCss();
    },

    /**
     * option 값에 맞춰 css 스타일을 지정한다.
     * @private
     */
    _initializeCss: function() {
        var color = this.grid.option('color')['border'],
            border = this.grid.option('border');

        this.$el.css({
            'overflow-x': this.grid.option('scrollX') ? 'scroll' : 'hidden',
            'overflow-y': this.grid.option('scrollY') ? 'scroll' : 'hidden',
            'height': this.grid.option('scrollX') ? this.model.height + this.grid.scrollBarSize : this.model.height
        });
        if (border === 0) {
            this.$el.css('border', 'solid 1px ' + color);
        }

    },

    /**
     * scroll event handler
     *  - scroll top 과 scroll left 를 동기화 한다.
     * @param {event} scrollEvent 스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        var difference = Math.abs(this.model.scrollTop - scrollEvent.target.scrollTop);
        //FF 에서의 스크롤 문제 해결
        if (difference < 10 && difference > 0) {
            if (this.model.scrollTop > scrollEvent.target.scrollTop) {
                scrollEvent.target.scrollTop -= 80;
            } else {
                scrollEvent.target.scrollTop += 80;
            }
        }
        this.model.set({
            'scrollTop': scrollEvent.target.scrollTop,
            'scrollLeft': scrollEvent.target.scrollLeft
        });
        this.invoke('scroll', scrollEvent);

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
        if (key === 'scrollTop') {
            this.el.scrollTop = value;
        } else if (key === 'scrollLeft') {
            this.el.scrollLeft = value;
            if (this.el.scrollLeft !== value) {
                this.model.set('scrollLeft', this.el.scrollLeft);
            }
        }
    },

    /**
     * 랜더링 한다.
     * @return {Container}
     */
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        this.selection = this.createView(Selection, {
            grid: this.grid,
            model: this.model
        });

        this.body = this.createView(Body, {
            grid: this.grid,
            selection: this.selection,
            model: this.model
        });

        this.$el.empty()
            .append(this.body.render().el)
            .append(this.selection.render().el);

        this._attachHandler();
        return this;
    }
});
