describe('view.virtual-scrollbar', function() {
    function getKeyEvent(keyCode, $target) {
        $target = $target || $('<div>')
        return {
            keyCode: keyCode,
            which: keyCode,
            target: $target.get(0),
            preventDefault: function() {},
            stopPropagation: function() {}
        };
    }
    var infinite,
        selection,
        virtual,
        $empty;
    beforeEach(function () {
        jasmine.clock().install();
        jasmine.getFixtures().fixturesPath = 'base/';
        jasmine.getStyleFixtures().fixturesPath = 'base/';

        loadFixtures('test/fixtures/empty.html');
        loadStyleFixtures('src/css/Component-SimpleGrid.css');

        $empty = $('#empty');
        infinite = new ne.Component.SimpleGrid({
            $el: $empty
        });
        infinite.setList([
            'This sentence is very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very ' +
            'very very very very very very long, the longest sentence in the world',
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
        virtual = infinite.view.virtualScroll;
        selection = infinite.view.container.content.selection;
    });
    afterEach(function() {
        infinite && infinite.destroy();
        infinite = null;
        jasmine.clock().uninstall();
    });
    describe('_onMouseDown', function() {
        it('lock 을 한다.', function() {
            virtual._onMouseDown();
            expect(infinite.model.collection.worker.locked).toBe(true);
        });
        it('handlerFocused 플래그를 설정한다.', function() {
            virtual._onMouseDown();
            expect(virtual.isScrollHandlerFocused).toBe(true);
        });
        it('1초 이후 lock 이 풀린다.', function() {
            virtual._onMouseDown();
            expect(virtual.isScrollHandlerFocused).toBe(true);
            jasmine.clock().tick(1001);
            expect(virtual.isScrollHandlerFocused).toBe(false);
            expect(infinite.model.collection.worker.locked).toBe(false);
        });
    });
    describe('_onModelChange', function() {
        it('scrollTop 값이 변경된다면, virtual scroll 의 실제 엘리먼트 값을 변경한다', function() {
            virtual._onModelChange({
                'key': 'scrollTop',
                'value': 20
            });
            expect(virtual.el.scrollTop).toBe(20);
        });
    });
    describe('_getMaxScrollTop', function() {
        it('현재 랜더링 기준으로 scrollTop 의 한계를 구한다.', function() {
            expect(virtual._getMaxScrollTop()).toBe(120);
        });
    });
    describe('_onScroll', function() {
        it('isScrollHandlerFocused 를 true 로 변경한다.', function() {
            virtual._onScroll({
                target: $('<div>')
            });
            expect(virtual.isScrollHandlerFocused).toBe(true);
        });

    });
});