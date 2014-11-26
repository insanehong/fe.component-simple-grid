/**
 * Created by NHNent on 2014-11-26.
 */
'use strict';
describe('view.keyboard', function() {
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
        keyboard,
        $empty;
    beforeEach(function () {
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
        keyboard = infinite.view.keyboard;
        selection = infinite.view.container.content.selection;
    });
    afterEach(function () {
        infinite && infinite.destroy();
        infinite = null;
    });
    describe('_onFocus', function() {
        it('selection 의 show 를 호출한다.', function() {
            selection.show = jasmine.createSpy('show');
            keyboard._onFocus();
            expect(selection.show).toHaveBeenCalled();
        });
    });
    describe('_onBlur', function() {
        it('selection 을 숨기고, collection 을 unlock 한다..', function() {
            keyboard.model.collection.lock();
            keyboard._onBlur();
            expect(selection.$el.css('display')).toBe('none');
            expect(selection.isShown).toBe(false);
            expect(keyboard.model.collection.worker.locked).toBe(false);
        });
    });
    describe('_onKeyUp', function() {
        it('collection 을 unlock 한다..', function() {
            keyboard.model.collection.lock();
            keyboard._onKeyUp();
            expect(keyboard.model.collection.worker.locked).toBe(false);
        });
    });
    describe('_onKeyDown', function() {
        it('로직의 정의된 Key Code 일 경우 이벤트 버블링 방지를 위해 stopPropagation 을 호출한다.', function() {
            var keyEvent,
                definedKeyList = [
                    'SHIFT',
                    'CTRL',
                    'META',
                    'UP_ARROW',
                    'DOWN_ARROW',
                    'LEFT_ARROW',
                    'RIGHT_ARROW',
                    'PAGE_UP',
                    'PAGE_DOWN',
                    'HOME',
                    'END',
                    'CHAR_A',
                    'CHAR_C'
                ];

            ne.util.forEachArray(definedKeyList, function(keyName) {
                keyEvent = getKeyEvent(keyboard.keyMap[keyName]);
                keyEvent.stopPropagation = jasmine.createSpy('stopPropagation');
                keyboard._onKeyDown(keyEvent);
                expect(keyEvent.stopPropagation).toHaveBeenCalled();
            }, this);

            keyEvent = getKeyEvent(keyboard.keyMap['undefined']);
            keyEvent.stopPropagation = jasmine.createSpy('stopPropagation');
            keyboard._onKeyDown(keyEvent);
            expect(keyEvent.stopPropagation).not.toHaveBeenCalled();
        });
    });
    describe('scrollVertical', function() {
        it('pixel 단위로 scrollTop 값을 조정한다.', function() {
            keyboard.scrollVertical(10);
            expect(keyboard.model.scrollTop).toBe(10);
        });
        it('percentage 단위로 scrollTop 값을 조정한다.', function() {
            keyboard.scrollVertical(10, true);
            expect(keyboard.model.scrollTop).toBe(20);
        });
    });
    describe('scrollHorizontal', function() {
        it('scrollLeft 값을 조정한다.', function() {
            keyboard.scrollHorizontal(20);
            expect(keyboard.model.scrollLeft).toBe(20);
        });

    });
});