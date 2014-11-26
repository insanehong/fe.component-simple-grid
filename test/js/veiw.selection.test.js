'use strict';
describe('view.selection', function() {
    var infinite,
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
        selection = infinite.view.container.content.selection;
    });
    afterEach(function() {
        infinite && infinite.destroy();
        infinite = null;
    });
    describe('draw', function() {
        it('selection 이 start 하지 않았다면 display none 이다.', function() {
            selection.draw();
            expect(selection.$el.css('display')).toBe('none');
        });
        it('rangeKey 가 정상적이지 않다면 display none 이다.', function() {
            selection.show();
            expect(selection.$el.css('display')).toBe('none');
        });
        it('아니라면 display block 이다.', function() {
            selection.isShown = true;
            selection.rangeKey = [2, 2];
            selection.draw();
            expect(selection.$el.css('display')).toBe('block');
        });
    });
    describe('show', function() {
        it('isShown 프로퍼티를 변경한다.', function() {
            selection.show();
            expect(selection.isShown).toBe(true);
        });
    });
    describe('hide', function() {
        it('isShown 프로퍼티를 변경한다.', function() {
            selection.show();
            selection.hide();
            expect(selection.isShown).toBe(false);
        });
    });
    describe('startSelection', function() {
        it('selection 을 시작한다.', function() {
            selection.startSelection(2);
            expect(selection.isShown).toBe(true);
        });
    });
    describe('stopSelection', function() {
        it('selection 에 해당하는 정보를 초기화하고 display none 으로 랜더링한다.', function() {
            selection.stopSelection();
            expect(selection.rangeKey).toEqual([-1, -1]);
            expect(selection.$el.css('display')).toBe('none');
        });
    });
    describe('selectAll', function() {
        it('전체영역을 셀렉트한다.', function() {
            var collection = selection.model.collection,
                key = collection.at(collection.length - 1).id;
            selection.selectAll();
            expect(selection.getSelectionRange()[0]).toBe(0);
            expect(selection.getSelectionRange()[1]).toBe(key);
        });
    });
    describe('getSelectionKey', function() {
        it('mouse x, y 좌표에 해당하는 key 를 반환한다', function() {
            expect(selection.getSelectionKey(100, 0)).toBe(0);
            expect(selection.getSelectionKey(0, 100)).toBe(4);
            expect(selection.getSelectionKey(2000, 200)).toBe(9);
            expect(selection.getSelectionKey(100, 300)).toBe(9);
            expect(selection.getSelectionKey(100, 400)).toBe(9);
            expect(selection.getSelectionKey(100, 500)).toBe(9);
        });
    });
    describe('getSelectionData, getSelectionLength', function() {
        beforeEach(function() {
            selection.startSelection(1);
            selection.updateSelection(10);
        });
        it('현재 영역의 data를 배열형태로 가져온다.', function() {
            var arr = selection.getSelectionData();
            expect(arr.length).toBe(10);
            expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
        it('getSelectionLength', function() {
            expect(selection.getSelectionLength()).toBe(10);
        });
    });
    describe('getSelectionRangeIndex', function() {
        beforeEach(function() {
            infinite.prepend([11, 12]);
            selection.startSelection(16);
            selection.updateSelection(10);
        });
        it('key 로 저장된 selection range 를 index 로 변환하여 반환한다.', function() {
            expect(selection.getSelectionRangeIndex()).toEqual([0, 12]);
        });
    });
});