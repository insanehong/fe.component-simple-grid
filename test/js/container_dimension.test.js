//'use strict';
//describe('컨테이너 사이즈 테스트', function() {
//    beforeEach(function() {
////        console.log('jasmine', jasmine);
//        jasmine.getFixtures().fixturesPath = 'base/';
//        jasmine.getStyleFixtures().fixturesPath = 'base/';
//
//        loadFixtures('test/fixtures/test.html');
//        loadStyleFixtures('src/css/Component-SimpleGrid.css');
//
//    });
//    afterEach(function(){
//
//    });
//
//    it('X 스크롤 존재할 때 높이 테스트', function() {
//        var height,
//            rowHeight = 20,
//            displayCount = 15,
//            simpleGrid = new ne.Component.SimpleGrid({
//                $el: $('#simpleGrid'),
//                rowHeight: rowHeight,
//                displayCount: displayCount,
//                scrollX: true,
//                freeze: true
//            }).setList(dummy.real);
//
//        height = rowHeight * displayCount + simpleGrid.scrollBarSize;
//        expect($('#simpleGrid').height()).toEqual(height);
//    });
//
//
//    it('X 스크롤 존재하지 않을때 높이 테스트', function() {
//        var height,
//            rowHeight = 20,
//            displayCount = 15,
//            simpleGrid = new ne.Component.SimpleGrid({
//                $el: $('#simpleGrid'),
//                rowHeight: rowHeight,
//                displayCount: displayCount,
//                scrollX: false,
//                freeze: true
//            }).setList(dummy.real);
//
//        height = rowHeight * displayCount;
//        expect($('#simpleGrid').height()).toEqual(height);
//    });
//});
