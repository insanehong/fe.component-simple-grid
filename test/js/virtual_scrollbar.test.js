'use strict';

describe('가상 스크롤바 테스트', function() {
//    for (var i = 0; i < 10; i++) {
//        dummy.real = dummy.real.concat(dummy.real);
//    }
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        jasmine.getStyleFixtures().fixturesPath = 'base/';

        loadFixtures('test/fixtures/test.html');
        loadStyleFixtures('src/css/Component-SimpleGrid.css');
    });
    afterEach(function(){

    });

    it('X 스크롤 존재할 때 Collection 의 list 기준 높이 테스트', function() {
        var rowHeight = 20,
            displayCount = 15,
            infinite = new ne.Component.SimpleGrid({
                $el: $('#simpleGrid'),
                rowHeight: rowHeight,
                displayCount: displayCount,
                scrollX: true,
                freeze: true
            }).setList(dummy.real),
            dataLength = infinite.model.collection.length,
            scrollContentHeight = infinite.view.virtualScroll._getContentHeight(),
            expectHeight = dataLength * rowHeight + infinite.scrollBarSize;

        expect(scrollContentHeight).toEqual(expectHeight);
    });


    it('X 스크롤 존재하지 않을때 Collection 의 list 기준 높이 테스트', function() {
        var rowHeight = 20,
            displayCount = 15,
            infinite = new ne.Component.SimpleGrid({
                $el: $('#simpleGrid'),
                rowHeight: rowHeight,
                displayCount: displayCount,
                scrollX: false,
                freeze: true
            }).setList(dummy.real),
            dataLength = infinite.model.collection.length,
            scrollContentHeight = infinite.view.virtualScroll._getContentHeight(),
            expectHeight = dataLength * rowHeight;

        expect(scrollContentHeight).toEqual(expectHeight);
    });


    it('원본 데이터 기준 높이 테스트 - IE 1533917px 이상 표현할 수 없다.', function() {
        var rowHeight = 20,
            displayCount = 15,
            infinite = new ne.Component.SimpleGrid({
                $el: $('#simpleGrid'),
                rowHeight: rowHeight,
                displayCount: displayCount,
                scrollX: true,
                freeze: true
            }).setList(dummy.real),
            dataLength = dummy.real.length,
            scrollContentHeight = infinite.view.virtualScroll._getContentHeight(),
            expectHeight = dataLength * rowHeight + infinite.scrollBarSize;

        if (expectHeight > 1533917 && ne.util.browser.msie) {
            expect(scrollContentHeight).not.toEqual(expectHeight);
        } else {
            expect(scrollContentHeight).toEqual(expectHeight);
        }
    });

});
