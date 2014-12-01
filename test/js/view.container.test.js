'use strict';
describe('view.container', function() {
    var simpleGrid,
        container,
        $empty;
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';

        loadFixtures('test/fixtures/empty.html');

        $empty = $('#empty');
        simpleGrid = new ne.Component.SimpleGrid({
            $el: $empty,
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
                    width: 200
                },
                {
                    columnName: 'column3',
                    title: '컬럼3',
                    width: 300
                },
                {
                    columnName: 'column4',
                    title: '컬럼4',
                    width: 400
                },
                {
                    columnName: 'column5',
                    title: '컬럼5',
                    width: 90
                }
            ]

        });
        container = simpleGrid.view.container;
    });

    describe('_initializeCss', function() {
        beforeEach(function() {
            simpleGrid.destroy();
        });
        describe('css를 옵션값에 맞추어 잘 설정하는지 확인한다.', function() {
            it('scroll 값이 true 라면 스크롤을 보인다', function() {
                simpleGrid = new ne.Component.SimpleGrid({
                    $el: $empty,
                    scrollX: true,
                    scrollY: true
                });
                container = simpleGrid.view.container;
                expect(container.$el.css('overflow-x')).toBe('scroll');
                expect(container.$el.css('overflow-y')).toBe('scroll');
            });
            it('scroll 값이 false 라면 스크롤을 감춘다', function() {
                simpleGrid = new ne.Component.SimpleGrid({
                    $el: $empty,
                    scrollX: false,
                    scrollY: false
                });
                container = simpleGrid.view.container;
                expect(container.$el.css('overflow-x')).toBe('hidden');
                expect(container.$el.css('overflow-y')).toBe('hidden');
            });
            it('scrollX 값에 따라 height 을 조금더 조정한다.', function() {
                simpleGrid = new ne.Component.SimpleGrid({
                    $el: $empty,
                    scrollX: false
                });
                container = simpleGrid.view.container;
                expect(container.$el.height()).toBe(211);
                simpleGrid = new ne.Component.SimpleGrid({
                    $el: $empty,
                    scrollX: true
                });
                container = simpleGrid.view.container;
                expect(container.$el.height()).toBe(228);
            });
        });
    });
    describe('_onModelChange', function() {
        var changeEvent;
        beforeEach(function() {
            jasmine.clock().install();
            simpleGrid.setList([{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"}]);
        });
        afterEach(function() {
            jasmine.clock().uninstall();
        });
        it('scrollTop 이 변경되는지 확인한다.', function() {
            changeEvent = {
                key: 'scrollTop',
                value: 10
            };
            container._onModelChange(changeEvent);
            expect(container.el.scrollTop).toBe(10);
        });
        it('scrollLeft 이 변경되는지 확인한다.', function() {
            changeEvent = {
                key: 'scrollLeft',
                value: 10
            };
            container._onModelChange(changeEvent);
            expect(container.el.scrollLeft).toBe(10);
        });
    });
    describe('_onScroll', function() {
        beforeEach(function() {
            simpleGrid.setList([{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"}]);
        });
        it('Firefox 에서 휠돌릴때 미세하게 스크롤될 경우, 스크롤 보정값이 잘 동작하는지 확인한다.', function() {
            container._onScroll({
                target: {
                    scrollTop: 2
                }
            });
            expect(container.model.scrollTop).toBe(21);
        });

    });
});
