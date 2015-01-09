'use strict';

describe('가상 스크롤바 테스트', function() {
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';

        loadFixtures('test/fixtures/test.html');
    });
    afterEach(function(){

    });

    it('X 스크롤 존재할 때 Collection 의 list 기준 높이 테스트', function() {
        var rowHeight = 20,
            displayCount = 15,
            simpleGrid = new ne.component.SimpleGrid({
                $el: $('#simpleGrid'),
                rowHeight: rowHeight,
                displayCount: displayCount,
                scrollX: true,
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
            }).setList([{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"}]),
            scrollContentHeight = simpleGrid.view.virtualScroll._getContentHeight();

        expect(scrollContentHeight).toEqual(249);
    });


    it('X 스크롤 존재하지 않을때 Collection 의 list 기준 높이 테스트', function() {
        var rowHeight = 20,
            displayCount = 15,
            simpleGrid = new ne.component.SimpleGrid({
                $el: $('#simpleGrid'),
                rowHeight: rowHeight,
                displayCount: displayCount,
                scrollX: false,
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
            }).setList([{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"}]),
            scrollContentHeight = simpleGrid.view.virtualScroll._getContentHeight();

        expect(scrollContentHeight).toEqual(232);
    });

});
