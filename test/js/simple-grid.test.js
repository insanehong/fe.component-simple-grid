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
    var simpleGrid,
        selection,
        $empty;
    beforeEach(function () {
        jasmine.clock().install();
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');

        $empty = $('#empty');
        simpleGrid = new ne.component.SimpleGrid({
            $el: $empty,
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
        selection = simpleGrid.view.container.selection;
    });
    afterEach(function() {
        simpleGrid && simpleGrid.destroy();
        simpleGrid = null;
        jasmine.clock().uninstall();
    });
    describe('focus', function() {
        beforeEach(function() {
            selection.show = jasmine.createSpy('show');
        });
        it('focus 되면 seleciton 의 show 를 호출한다.', function() {
            simpleGrid.focus();
            expect(selection.show).toHaveBeenCalled();
        });
    });
    describe('_onMouseDown', function() {
        it('mousedown 이벤트가 발생하면, collection 을 lock 하고, layoutdata 를 업데이트 한다.', function() {
            simpleGrid.model.collection.lock = jasmine.createSpy('lock');
            simpleGrid.updateLayoutData = jasmine.createSpy('layout');
            simpleGrid.focus = jasmine.createSpy('focus');
            simpleGrid._onMouseDown();
            expect(simpleGrid.model.collection.lock).toHaveBeenCalled();
            expect(simpleGrid.updateLayoutData).toHaveBeenCalled();
            expect(simpleGrid.focus).not.toHaveBeenCalled();
            jasmine.clock().tick(10);
            expect(simpleGrid.focus).toHaveBeenCalled();
        });
    });
    describe('_onMouseUp', function() {
        it('mouseup 이벤트가 발생하면 collection 을 unlock 한다.', function() {
            var unlock = simpleGrid.model.collection.unlock = jasmine.createSpy('unlock');
            simpleGrid._onMouseUp();
            expect(unlock).toHaveBeenCalled();
        });
    });
    describe('getList', function() {
        it('현재 설정된 list 를 반환한다.', function() {
            var list = simpleGrid.getList();
            expect(list.length).toBe(11);
        });
    });
    describe('append', function() {
        it('model 의 collection 의 append 를 호출한다.', function() {
            var append = simpleGrid.model.collection.append = jasmine.createSpy('append');
            simpleGrid.append([1, 2, 3, 4]);
            expect(append).toHaveBeenCalled();
        });
    });
    describe('prepend', function() {
        it('model 의 collection 의 prepend 를 호출한다..', function() {
            var prepend = simpleGrid.model.collection.prepend = jasmine.createSpy('prepend');
            simpleGrid.prepend([1, 2, 3, 4]);
            expect(prepend).toHaveBeenCalled();
        });
    });
    //describe('remove', function() {
    //    it('model 의 collection 의 remove 를 호출한다.', function() {
    //        var prepend = simpleGrid.model.collection.prepend = jasmine.createSpy('prepend');
    //        simpleGrid.prepend([1, 2, 3, 4]);
    //        expect(prepend).toHaveBeenCalled();
    //    });
    //});


    describe('option', function() {
        it('인자를 두개 넘기면 set 으로, 한개 넘기면 get 으로 동작한다.', function() {
            simpleGrid.option('testVal', 1);
            expect(simpleGrid.option('testVal')).toBe(1);
        });
    });
});