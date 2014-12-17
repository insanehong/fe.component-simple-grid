'use strict';
describe('Base 테스트', function() {
    var instance,
        $empty;
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');
    });

    describe('Base 클래스 테스트', function() {
        beforeEach(function() {
            instance = new Base();
        });
        describe('_getUniqueKey', function() {
            it('반드시 unique 한 key 를 반환해야 한다.', function() {
                var i = 0,
                    next,
                    len = 100000,
                    keyList = [],
                    sortedKeyList;
                for (; i < len; i++) {
                    keyList.push(instance.getUniqueKey());
                }
                sortedKeyList = keyList.sort();

                for (; i < len; i++) {
                    next = i + 1;
                    if (next !== len) {
                        expect(sortedKeyList[i]).not.toEqual(sortedKeyList[next]);
                    }
                }
            });
        });
        describe('setOwnProperties', function() {
            it('setOwnProperties() 의 동작을 확인한다.', function() {

                instance.setOwnProperties({
                    value1: 1,
                    value2: 2,
                    value3: 3
                });
                expect(instance.value1).toBe(1);
                expect(instance.value2).toBe(2);
                expect(instance.value3).toBe(3);
                expect(instance.value4).not.toBeDefined();

                expect(instance.hasOwnProperty('value1')).toBe(true);
                expect(instance.hasOwnProperty('value2')).toBe(true);
                expect(instance.hasOwnProperty('value3')).toBe(true);
                expect(instance.hasOwnProperty('value4')).toBe(false);
            });
        });
        describe('error', function() {
            it('error() 로 에러 객체를 생성할 수 있다.', function() {
                var message = 'errorMessage',
                    error = instance.error(message);

                expect(error instanceof Error).toBe(true);
                expect(error.hasOwnProperty('message')).toBe(true);
                expect(error.message).toEqual(message);
            });
        });
    });
    describe('Base.View 클래스 테스트', function() {
        var instance,
            TestView;
        beforeEach(function() {
            TestView = ne.util.defineClass(Base.View, {
                tagName: 'p',
                className: 'testClass',
                eventHandler: {
                    'click': '_onClick',
                    'mouseup': '_onMouseUp'
                },
                init: function() {
                    Base.View.prototype.init.apply(this, arguments);
                },
                _onClick: function() {
                    console.log('test 0');
                },
                _onMouseUp: function() {
                    console.log('test 1');
                }
            });

            instance = new Base.View();
        });
        describe('init', function() {
            afterEach(function() {
                instance.destroy();
            });
            it('element 를 생성하는지 확인한다.', function() {
                instance = new TestView();
                expect(instance.$el.is('p')).toBe(true);
                expect(instance.$el.hasClass('testClass')).toBe(true);
            });
            it('_eventHandler 를 생성하는지 확인한다.', function() {
                instance = new TestView();
                expect(instance._eventHandler).toEqual({
                    click: instance._eventHandler['click'],
                    mouseup: instance._eventHandler['mouseup']
                });
            });
        });
        describe('_dispatchHandler', function() {
            afterEach(function() {
                instance.destroy();
            });
            beforeEach(function() {
                instance = new TestView();
                instance._detachHandler(instance.$el);
                instance._eventHandler = {};
            });
            it('이벤트 핸들러를 잘 붙이는지 확인한다.', function() {
                instance._eventHandler['click'] = jasmine.createSpy('click');
                instance._eventHandler['mouseup'] = jasmine.createSpy('mouseup');
                instance._dispatchHandler(instance.$el, true);
                instance.$el.trigger('click');
                expect(instance._eventHandler['click']).toHaveBeenCalled();
                instance.$el.trigger('mouseup');
                expect(instance._eventHandler['mouseup']).toHaveBeenCalled();
            });
            it('이벤트 핸들러를 잘 해제하는지 확인한다.', function() {
                instance._eventHandler['click'] = jasmine.createSpy('click');
                instance._eventHandler['mouseup'] = jasmine.createSpy('mouseup');
                instance._dispatchHandler(instance.$el, true);
                instance._dispatchHandler(instance.$el, false);
                instance.$el.trigger('click');
                instance.$el.trigger('mouseup');

                expect(instance._eventHandler['click']).not.toHaveBeenCalled();
                expect(instance._eventHandler['mouseup']).not.toHaveBeenCalled();
            });
        });
        describe('view 생성, 삭제', function() {

            it('createView() 로 자식 view 를 생성하고 _viewList 에 저장한다.', function() {
                var view = new Base.View(),
                    childView1 = view.createView(Base.View, {grid: 'grid'}),
                    childView2 = view.createView(Base.View, {grid: 'grid'});

                expect(view._viewList[0]).toEqual(childView1);
                expect(view._viewList[1]).toEqual(childView2);
                expect(view._viewList.length).toBe(2);
            });
            it('destroyChildren() 로 등록된 자식 view 들을 제거한다.', function() {
                var view = new Base.View({
                    grid: 'grid'
                });
                var childView1 = view.createView(Base.View, {grid: 'grid'}),
                    childView2 = view.createView(Base.View, {grid: 'grid'}),
                    grandChildView1 = childView1.createView(Base.View, {grid: 'grid'}),
                    grandChildView2 = childView1.createView(Base.View, {grid: 'grid'}),
                    grandChildView3 = childView1.createView(Base.View, {grid: 'grid'});

                view.destroyChildren();
                expect(view._viewList.length).toBe(0);
                expect(childView1._viewList.length).toBe(0);
                expect(childView2._viewList.length).toBe(0);
                expect(grandChildView1._viewList.length).toBe(0);
                expect(grandChildView2._viewList.length).toBe(0);
                expect(grandChildView3._viewList.length).toBe(0);
            });
        });
    });
});
