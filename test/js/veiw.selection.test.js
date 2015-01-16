'use strict';
describe('view.selection', function() {
    var simpleGrid,
        selection,
        $empty;
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';

        loadFixtures('test/fixtures/empty.html');

        $empty = $('#empty');
        simpleGrid = new ne.component.SimpleGrid({
            useSelection: true,
            $el: $empty,
            columnModelList: [
                {
                    columnName: 'column1',
                    title: '컬럼1',
                    width: 700,
                    align: 'center',
                    formatter: function(value, rowData) {
                        return '<img src="' + value + '"/>';
                    }
                },
                {
                    columnName: 'column2',
                    title: '컬럼1',
                    width: 630
                },
                {
                    columnName: 'column3',
                    title: '컬럼3',
                    width: 70
                },
                {
                    columnName: 'column4',
                    title: '컬럼4',
                    width: 80
                },
                {
                    columnName: 'column5',
                    title: '컬럼5',
                    width: 90
                }
            ]
        });
        simpleGrid.setList([{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"},{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"},{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"}]);
        selection = simpleGrid.view.container.body.selection;
    });
    afterEach(function() {
        simpleGrid && simpleGrid.destroy();
        simpleGrid = null;
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
            expect(selection.getKey(100, 0)).toBe(0);
            expect(selection.getKey(0, 100)).toBe(2);
            expect(selection.getKey(2000, 200)).toBe(7);
            expect(selection.getKey(100, 300)).toBe(10);
            expect(selection.getKey(100, 400)).toBe(10);
            expect(selection.getKey(100, 500)).toBe(10);
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
            expect(arr).toEqual([ '1_0	1_1	1_2	1_3	1_4', '2_0	2_1	2_2	2_3	2_4', '3_0	3_1	3_2	3_3	3_4', '4_0	4_1	4_2	4_3	4_4', '5_0	5_1	5_2	5_3	5_4', '6_0	6_1	6_2	6_3	6_4', '7_0	7_1	7_2	7_3	7_4', '8_0	8_1	8_2	8_3	8_4', '9_0	9_1	9_2	9_3	9_4', '10_0	10_1	10_2	10_3	10_4' ]);
        });
        it('getSelectionLength', function() {
            expect(selection.getSelectionLength()).toBe(10);
        });
    });
    describe('getSelectionRangeIndex', function() {
        beforeEach(function() {
            simpleGrid.prepend([{"column1":"11_0","column2":"11_1","column3":"11_2","column4":"11_3","column5":"11_4"},
                {"column1":"12_0","column2":"12_1","column3":"12_2","column4":"12_3","column5":"12_4"}]);
            selection.startSelection(11);
            selection.updateSelection(10);
        });
        it('key 로 저장된 selection range 를 index 로 변환하여 반환한다.', function() {
            expect(selection.getSelectionRangeIndex()).toEqual([12, 13]);
        });
    });
    describe('attachMouseEvent', function() {
        it('초기 마우스 포지션이 잘 바인딩 되는지 확인한다.', function() {
            selection.attachMouseEvent({
                pageX: 10,
                pageY: 20
            });
            expect(selection.startPageX).toBe(10);
            expect(selection.startPageY).toBe(20);
        });
    });
    describe('_onMouseDown', function() {
        it('focusModel 의 select 를 호출하는지 확인한다.', function() {
            selection.grid.focusModel.select = jasmine.createSpy('select');
            selection._onMouseDown({
                pageX: 10,
                pageY: 20
            });
            expect(selection.grid.focusModel.select).toHaveBeenCalled();
        });
        it('shift 키와 함께 눌렸을 경우 startSelection 을 호출한다.', function() {
            selection.grid.focusModel.select = jasmine.createSpy('select');
            selection._onMouseDown({
                pageX: 10,
                pageY: 20,
                shiftKey: true
            });
            expect(selection.grid.focusModel.select).toHaveBeenCalled();
        });
    });
    describe('_onMouseUp', function() {
        it('detachMouseEvent 를 호출하는지 확인한다.', function() {
            selection.detachMouseEvent = jasmine.createSpy('detachMouseEvent');
            selection._onMouseUp();
            expect(selection.detachMouseEvent).toHaveBeenCalled();
        });
    });
    describe('_scrollOnSelection', function() {

        describe('overflow 상태에 따라 스크롤 값을 조정하는지 확인한다.', function() {
            beforeEach(function() {
                selection.startSelection(1);
            });
            it('pageY 가 overflow -', function() {
                selection.model.scrollTop = 300;
                selection.mousePos.pageX = 0;
                selection.mousePos.pageY = 0;
                selection._scrollOnSelection();
                expect(selection.model.scrollTop).toBe(260);
                selection._scrollOnSelection();
                expect(selection.model.scrollTop).toBe(220);
            });
            it('pageY 가 overflow +', function() {
                selection.mousePos.pageX = 0;
                selection.mousePos.pageY = 500;
                selection._scrollOnSelection();
                expect(selection.model.scrollTop).toBe(40);
            });
            it('pageX 가 overflow -', function() {
                selection.model.scrollLeft = 300;
                selection.mousePos.pageX = 0;
                selection._scrollOnSelection();
                expect(selection.model.scrollLeft).toBe(260);
            });
            it('pageX 가 overflow +', function() {
                selection.model.scrollLeft = 300;
                selection.mousePos.pageX = 1500;
                selection._scrollOnSelection();
                expect(selection.model.scrollLeft).toBe(340);
            });
        });

    });
});