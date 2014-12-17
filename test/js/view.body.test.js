'use strict';
describe('view.container', function() {
    var simpleGrid,
        body,
        selection,
        $empty;
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';

        loadFixtures('test/fixtures/empty.html');

        $empty = $('#empty');
        simpleGrid = new ne.Component.SimpleGrid({
            $el: $empty,
            useSelection: true,
            columnModelList: [
                {
                    columnName: 'column1',
                    title: '컬럼1',
                    width: 70,
                    align: 'center',
                    formatter: function(value, rowData) {
                        return '<input type="button" class="test_click" value="' + value + '"/>';
                    }
                },
                {
                    columnName: 'column2',
                    title: '컬럼1',
                    width: 60
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
        simpleGrid.setList([{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"}]);

        body = simpleGrid.view.container.body;
        selection = simpleGrid.view.container.body.selection;
    });
    afterEach(function() {
        simpleGrid && simpleGrid.destroy();
    });
    describe('select', function() {
        it('select 디자인 클래스를 설정한다.', function() {
            var key = 3,
                $tr = simpleGrid.$el.find('tr[key="' + key + '"]');
            expect($tr.hasClass('selected')).toBe(false);
            body.select(3);
            expect($tr.hasClass('selected')).toBe(true);
        });
    });
    describe('select', function() {
        it('select 디자인 클래스를 제거한다.', function() {
            var key = 3,
                $tr = simpleGrid.$el.find('tr[key="' + key + '"]');
            expect($tr.hasClass('selected')).toBe(false);
            body.select(3);
            expect($tr.hasClass('selected')).toBe(true);
            body.unselect(3);
            expect($tr.hasClass('selected')).toBe(false);
        });
    });
    describe('_onClick', function() {
        it('click 커스텀 이벤트를 발생하는지 확인한다.', function() {
            var $td = simpleGrid.$el.find('tr[key="3"]').find('td[columnname="column1"]'),
                callback = jasmine.createSpy('callback');

            body.on('click', callback);

            body._onClick({
                target: $td.get(0)
            });
            expect(callback).toHaveBeenCalled();
        });
    });
    describe('_onMouseDown', function() {
        it('shift key 를 누르면 selection 을 생성하는지 확인한다.', function() {
            var $td = simpleGrid.$el.find('tr[key="3"]').find('td[columnname="column1"]');
            body._onMouseDown({
                target: $td.get(0),
                shiftKey: true
            });
            expect(body.selection.hasSelection()).toBe(true);
        });
        it('mouse down 시 새로운 selection을 생성하기 위해 selection 종료를 호출하는지 확인한다.', function() {
            var $td = simpleGrid.$el.find('tr[key="3"]').find('td[columnname="column1"]');
            body.selection.stopSelection = jasmine.createSpy('stop');
            body._onMouseDown({
                target: $td.get(0)
            });
            expect(body.selection.stopSelection).toHaveBeenCalled();
        });
    });
    describe('_onScroll', function() {
        it('selection 사용으로 되어있을 경우 draw 를 호출한다.', function() {
            body.selection.draw = jasmine.createSpy('draw');
            body._onScroll();
            expect(body.selection.draw).toHaveBeenCalled();
        });
    });
});
