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
        virtual,
        $empty;
    describe('border = 1 이상일경우', function() {
        beforeEach(function () {
            jasmine.clock().install();
            jasmine.getFixtures().fixturesPath = 'base/';

            loadFixtures('test/fixtures/empty.html');
            border: 1,
            $empty = $('#empty');
            simpleGrid = new ne.Component.SimpleGrid({
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
            simpleGrid.setList([{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"},{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"}]);
            virtual = simpleGrid.view.virtualScroll;
            selection = simpleGrid.view.container.body.selection;
        });
        afterEach(function() {
            simpleGrid && simpleGrid.destroy();
            simpleGrid = null;
            jasmine.clock().uninstall();
        });
        describe('_onMouseDown', function() {
            it('lock 을 한다.', function() {
                virtual._onMouseDown();
                expect(simpleGrid.model.collection.worker.locked).toBe(true);
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
                expect(simpleGrid.model.collection.worker.locked).toBe(false);
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
                expect(virtual._getMaxScrollTop()).toBe(252);
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
    describe('border = 0 이상일경우', function() {
        beforeEach(function () {
            jasmine.clock().install();
            jasmine.getFixtures().fixturesPath = 'base/';

            loadFixtures('test/fixtures/empty.html');

            $empty = $('#empty');
            simpleGrid = new ne.Component.SimpleGrid({
                $el: $empty,
                border: 0,
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
            simpleGrid.setList([{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"},{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"}]);
            virtual = simpleGrid.view.virtualScroll;
            selection = simpleGrid.view.container.body.selection;
        });
        afterEach(function() {
            simpleGrid && simpleGrid.destroy();
            simpleGrid = null;
            jasmine.clock().uninstall();
        });
        describe('_onMouseDown', function() {
            it('lock 을 한다.', function() {
                virtual._onMouseDown();
                expect(simpleGrid.model.collection.worker.locked).toBe(true);
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
                expect(simpleGrid.model.collection.worker.locked).toBe(false);
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
                expect(virtual._getMaxScrollTop()).toBe(229);
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
});