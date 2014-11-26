'use strict';
describe('view.container', function() {
    var infinite,
        content,
        selection,
        $empty;
    beforeEach(function() {
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

        content = infinite.view.container.content;
        selection = infinite.view.container.content.selection;
    });
    afterEach(function() {
        content._stopSelection();
        infinite && infinite.destroy();
    });
    describe('_setMousePos', function() {
        it('mouse position 을 잘 저장하는지 확인한다.', function() {
            content._setMousePos({
                pageX: 20,
                pageY: 30
            });
            expect(content.mousePos.pageX).toBe(20);
            expect(content.mousePos.pageY).toBe(30);
        });
    });
    describe('_scrollOnSelection', function() {
        beforeEach(function() {
            content._startSelection(10, 10);
        });
        it('overflow status y  > 0 라면 아래로 scroll 한다.', function() {
            content._setMousePos({
                pageX: 10,
                pageY: 3000
            });
            content._scrollOnSelection();
            expect(content.model.scrollTop).toBe(40);
        });
        it('overflow status y  < 0 라면 위로 scroll 한다.', function() {
            content._setMousePos({
                pageX: 10,
                pageY: 3000
            });
            content._scrollOnSelection();
            content._scrollOnSelection();
            expect(content.model.scrollTop).toBe(80);

            content._setMousePos({
                pageX: 10,
                pageY: 0
            });
            content._scrollOnSelection();
            expect(content.model.scrollTop).toBe(40);
        });
        it('overflow status x  > 0 라면 오른쪽 scroll 한다.', function() {
            content._setMousePos({
                pageX: 2000,
                pageY: 100
            });
            content._scrollOnSelection();
            expect(content.model.scrollLeft).toBe(40);
        });
        it('overflow status x  < 0 라면 왼쪽 scroll 한다.', function() {
            content._setMousePos({
                pageX: 2000,
                pageY: 100
            });
            content._scrollOnSelection();
            content._scrollOnSelection();
            expect(content.model.scrollLeft).toBe(80);

            content._setMousePos({
                pageX: 0,
                pageY: 100
            });
            content._scrollOnSelection();
            expect(content.model.scrollLeft).toBe(40);
        });
    });

    describe('_updateSelection', function() {
        beforeEach(function() {
            jasmine.clock().install();
            content._startSelection(10, 10);
        });
        afterEach(function() {
            jasmine.clock().uninstall();
        });
        it('selection 영역을 update 하는지 확인한다.', function() {
            expect(selection.getSelectionRange()).toEqual([0, 0]);
            content._setMousePos({
                pageX: 10,
                pageY: 60
            });
            content._updateSelection();
            jasmine.clock().tick(10);
            expect(selection.getSelectionRange()).toEqual([0, 2]);
        });
    });
    describe('_onMouseDown', function() {
        var mouseEvent;
        beforeEach(function() {
            jasmine.clock().install();
            mouseEvent = {
                preventDefault: function() {},
                pageX: 10,
                pageY: 60
            };
        });
        afterEach(function() {
            jasmine.clock().uninstall();
        });
        describe('shift key 와 함께 눌렸을 경우', function() {
            beforeEach(function() {
                mouseEvent.shiftKey = true;
            });
            it('selection range 가 이미 있을 경우 추가로 update 한다.', function() {
                content._startSelection(10, 10);
                expect(selection.getSelectionRange()).toEqual([0, 0]);
                content._onMouseDown(mouseEvent);
                jasmine.clock().tick(10);
                expect(selection.getSelectionRange()).toEqual([0, 2]);
            });
            it('selection range 가 없을 경우 selection 을 시작한다.', function() {
                expect(selection.getSelectionRange()).toEqual([-1, -1]);
                content._onMouseDown(mouseEvent);
                jasmine.clock().tick(10);
                expect(selection.getSelectionRange()).toEqual([2, 2]);
            });
        });
        describe('그냥 눌렀을 경우', function() {
            it('selection 을 시작한다.', function() {
                expect(selection.getSelectionRange()).toEqual([-1, -1]);
                content._onMouseDown(mouseEvent);
                jasmine.clock().tick(10);
                expect(selection.getSelectionRange()).toEqual([2, 2]);
            });
        });
    });
    describe('_onScroll', function() {
        it('selection 이 없을 때에는 selection 의 위치정보만 갱신하기 위해 draw를 호출한다.', function() {
            content.selection.draw = jasmine.createSpy('selection draw');
            content._onScroll();
            expect(content.selection.draw).toHaveBeenCalled();
        });
        //it('selection 이 있을 때에는 selection 정보를 전체 갱신한다.', function() {
        //    content._updateSelection = jasmine.createSpy('_updateSelection');
        //    content._onScroll();
        //    expect(content.selection.draw).toHaveBeenCalled();
        //});
    });
});