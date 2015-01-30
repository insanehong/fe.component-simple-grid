'use strict';
describe('view.resize-handler', function() {
    var simpleGrid,
        container,
        handler,
        $empty;
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';

        loadFixtures('test/fixtures/empty.html');

        $empty = $('#empty').width(1000).css('left', '0px');
        $('body').css({
            'padding': 0
        });
        simpleGrid = new ne.component.SimpleGrid({
            $el: $empty,
            useColumnResize: true,
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
        simpleGrid.setList([{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"},{"column1":"0_0","column2":"0_1","column3":"0_2","column4":"0_3","column5":"0_4"},{"column1":"1_0","column2":"1_1","column3":"1_2","column4":"1_3","column5":"1_4"},{"column1":"2_0","column2":"2_1","column3":"2_2","column4":"2_3","column5":"2_4"},{"column1":"3_0","column2":"3_1","column3":"3_2","column4":"3_3","column5":"3_4"},{"column1":"4_0","column2":"4_1","column3":"4_2","column4":"4_3","column5":"4_4"},{"column1":"5_0","column2":"5_1","column3":"5_2","column4":"5_3","column5":"5_4"},{"column1":"6_0","column2":"6_1","column3":"6_2","column4":"6_3","column5":"6_4"},{"column1":"7_0","column2":"7_1","column3":"7_2","column4":"7_3","column5":"7_4"},{"column1":"8_0","column2":"8_1","column3":"8_2","column4":"8_3","column5":"8_4"},{"column1":"9_0","column2":"9_1","column3":"9_2","column4":"9_3","column5":"9_4"},{"column1":"10_0","column2":"10_1","column3":"10_2","column4":"10_3","column5":"10_4"}]);
        handler = simpleGrid.view.header.resizeHandler;
    });


    describe('_refreshHandlerPosition', function() {
        it('resize handler 의 position 을 잘 할당하는지 확인한다.', function() {
            var $handlerList = handler.$el.find('.infinite_resize_handler');
            handler._refreshHandlerPosition();

            expect($handlerList.eq(0).css('left')).toBe('97px');
            expect($handlerList.eq(1).css('left')).toBe('298px');
            expect($handlerList.eq(2).css('left')).toBe('599px');
            expect($handlerList.eq(3).css('left')).toBe('1000px');
            expect($handlerList.eq(4).css('left')).toBe('1091px');
        });
    });
    describe('_calculateWidth', function() {
        beforeEach(function() {
            handler.initialOffsetLeft = 10;
            handler.initialLeft = 300;
            handler.initialWidth = 300;
        });
        it('마우스 위치인 pageX 로부터 width 를 계산한다.', function() {
            expect(handler._calculateWidth(200)).toBe(190);
            expect(handler._calculateWidth(500)).toBe(490);
            expect(handler._calculateWidth(11)).toBe(1);
        });
    });
    describe('mouseEvent', function() {
        var mouseEvent,
            $handlerList;

        beforeEach(function() {
            mouseEvent = {
                pageX: 98,
                pageY: 20,
                target: handler.$el.find('.infinite_resize_handler:eq(1)'),
                preventDefault: function(){}
            };
            $handlerList = handler.$el.find('.infinite_resize_handler');

            handler._onMouseDown(mouseEvent);
        });
        afterEach(function() {
            handler._onMouseUp();
        });
        it('_onMouseMove', function() {
            mouseEvent.pageX = 300;
            handler._onMouseMove(mouseEvent);
            expect($handlerList.eq(1).css('left')).toBe('292px');

            mouseEvent.pageX = 400;
            handler._onMouseMove(mouseEvent);
            expect($handlerList.eq(1).css('left')).toBe('392px');
        });
    });
});
