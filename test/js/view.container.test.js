'use strict';
describe('view.container', function() {
    var infinite,
        container,
        $empty;
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        jasmine.getStyleFixtures().fixturesPath = 'base/';

        loadFixtures('test/fixtures/empty.html');
        loadStyleFixtures('src/css/Component-SimpleGrid.css');

        $empty = $('#empty');
        infinite = new ne.Component.SimpleGrid({
            $el: $empty
        });
        container = infinite.view.container;
    });

    describe('_initializeCss', function() {
        beforeEach(function() {
            infinite.destroy();
        });
        describe('css를 옵션값에 맞추어 잘 설정하는지 확인한다.', function() {
            it('scroll 값이 true 라면 스크롤을 보인다', function() {
                infinite = new ne.Component.SimpleGrid({
                    $el: $empty,
                    scrollX: true,
                    scrollY: true
                });
                container = infinite.view.container;
                expect(container.$el.css('overflow-x')).toBe('scroll');
                expect(container.$el.css('overflow-y')).toBe('scroll');
            });
            it('scroll 값이 false 라면 스크롤을 감춘다', function() {
                infinite = new ne.Component.SimpleGrid({
                    $el: $empty,
                    scrollX: false,
                    scrollY: false
                });
                container = infinite.view.container;
                expect(container.$el.css('overflow-x')).toBe('hidden');
                expect(container.$el.css('overflow-y')).toBe('hidden');
            });
            it('scrollX 값에 따라 height 을 조금더 조정한다.', function() {
                infinite = new ne.Component.SimpleGrid({
                    $el: $empty,
                    scrollX: false
                });
                container = infinite.view.container;
                expect(container.$el.height()).toBe(200);
                infinite = new ne.Component.SimpleGrid({
                    $el: $empty,
                    scrollX: true
                });
                container = infinite.view.container;
                expect(container.$el.height()).toBe(217);
            });
        });
    });
    describe('_onModelChange', function() {
        var changeEvent;
        beforeEach(function() {
            jasmine.clock().install();
            infinite.setList([
                'This sentence is very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very ' +
                'very very very very very very long, the longest sentence in the world',
                1, 2, 3, 4, 5, 6, 7 ,8 ,9, 10, 11, 12, 13, 14, 15]);
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
});
