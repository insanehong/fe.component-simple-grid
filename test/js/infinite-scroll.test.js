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
        selection = infinite.view.container.selection;
    });
    afterEach(function() {
        infinite && infinite.destroy();
        infinite = null;
        jasmine.clock().uninstall();
    });
    describe('focus', function() {
        beforeEach(function() {
            selection.show = jasmine.createSpy('show');
        });
        it('focus 되면 seleciton 의 show 를 호출한다.', function() {
            infinite.focus();
            expect(selection.show).toHaveBeenCalled();
        });
    });
    describe('_onMouseDown', function() {
        it('mousedown 이벤트가 발생하면, collection 을 lock 하고, layoutdata 를 업데이트 한다.', function() {
            infinite.model.collection.lock = jasmine.createSpy('lock');
            infinite.updateLayoutData = jasmine.createSpy('layout');
            infinite.focus = jasmine.createSpy('focus');
            infinite._onMouseDown();
            expect(infinite.model.collection.lock).toHaveBeenCalled();
            expect(infinite.updateLayoutData).toHaveBeenCalled();
            expect(infinite.focus).not.toHaveBeenCalled();
            jasmine.clock().tick(10);
            expect(infinite.focus).toHaveBeenCalled();
        });
    });
    describe('_onMouseUp', function() {
        it('mouseup 이벤트가 발생하면 collection 을 unlock 한다.', function() {
            var unlock = infinite.model.collection.unlock = jasmine.createSpy('unlock');
            infinite._onMouseUp();
            expect(unlock).toHaveBeenCalled();
        });
    });
    describe('getList', function() {
        it('현재 설정된 list 를 반환한다.', function() {
            var list = infinite.getList();
            expect(list.length).toBe(16);
        });
    });
    describe('append', function() {
        it('model 의 collection 의 append 를 호출한다..', function() {
            var append = infinite.model.collection.append = jasmine.createSpy('append');
            infinite.append([1, 2, 3, 4]);
            expect(append).toHaveBeenCalled();
        });
    });
    describe('prepend', function() {
        it('model 의 collection 의 prepend 를 호출한다..', function() {
            var prepend = infinite.model.collection.prepend = jasmine.createSpy('prepend');
            infinite.prepend([1, 2, 3, 4]);
            expect(prepend).toHaveBeenCalled();
        });
    });
    describe('option', function() {
        it('인자를 두개 넘기면 set 으로, 한개 넘기면 get 으로 동작한다.', function() {
            infinite.option('testVal', 1);
            expect(infinite.option('testVal')).toBe(1);
        });
    });
});