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
    var simpleGrid,
        selection,
        keyboard,
        $empty;
    beforeEach(function () {
        jasmine.getFixtures().fixturesPath = 'base/';

        loadFixtures('test/fixtures/empty.html');

        $empty = $('#empty');
        simpleGrid = new ne.component.SimpleGrid({
            $el: $empty,
            useSelection: true,
            columnModelList: [
                {
                    columnName: 'column1',
                    title: '컬럼1',
                    width: 100,
                    align: 'center',
                    formatter: function(value, rowData) {
                        return '<input type="button" class="test_click" value="' + value + '"/>';
                    }
                },
                {
                    columnName: 'column2',
                    title: '컬럼1',
                    width: 600
                },
                {
                    columnName: 'column3',
                    title: '컬럼3',
                    width: 100
                },
                {
                    columnName: 'column4',
                    title: '컬럼4',
                    width: 300
                },
                {
                    columnName: 'column5',
                    title: '컬럼5',
                    width: 90
                }
            ]
        });
        simpleGrid.setList([{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"}]);
        keyboard = simpleGrid.view.keyboard;
        selection = simpleGrid.view.container.body.selection;
    });
    afterEach(function () {
        simpleGrid && simpleGrid.destroy();
        simpleGrid = null;
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
            expect(keyboard.model.scrollTop).toBe(21);
        });
    });
    describe('scrollHorizontal', function() {
        it('scrollLeft 값을 조정한다.', function() {
            keyboard.scrollHorizontal(20);
            expect(keyboard.model.scrollLeft).toBe(20);
        });

    });
});