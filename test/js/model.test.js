'use strict';
describe('model 테스트', function() {
    var grid,
        model;
    beforeEach(function() {
        grid = {
            option: function(key) {
                return this.options[key];
            },
            options: {
                border: 1,
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
                ],
                rowHeight: 20,
                headerHeight: 50
            }
        };
        model = new Model({
            grid: grid
        });
    });
    describe('_getMaxCollectionLength', function() {
        var isIe;
        beforeEach(function() {
            isIe = ne.util.browser.msie;
        });
        afterEach(function() {
            ne.util.browser.msie = isIe;
        });
        it('IE 가 아닐경우 0 을 반환한다.', function() {
            ne.util.browser.msie = false;
            expect(model._getMaxCollectionLength()).toBe(0);
        });
        it('IE 일 경우 rowHeight 로 나눈 값을 반환한다.', function() {
            ne.util.browser.msie = true;
            model.rowHeight = 20;
            expect(model._getMaxCollectionLength()).toBe(73042);
        });
    });
    describe('_onChange', function() {
        beforeEach(function() {
            model._onScrollTopChange = jasmine.createSpy('_onScrollTopChange');
            model._onScrollLeftChange = jasmine.createSpy('_onScrollTopChange');
            model._getMaxCollectionLength = jasmine.createSpy('_getMaxCollectionLength');
        });
        it('scrollTop 변경의 경우 _onScrollTopChange 를 호출한다.', function() {
            model._onChange({
                key: 'scrollTop',
                value: 20
            });
            expect(model._onScrollTopChange).toHaveBeenCalledWith(20);
            expect(model._getMaxCollectionLength).not.toHaveBeenCalled();
            expect(model._onScrollLeftChange).not.toHaveBeenCalled();
        });
        it('scrollTop 변경의 경우 _onScrollLeftChange 를 호출한다.', function() {
            model._onChange({
                key: 'scrollLeft',
                value: 30
            });
            expect(model._onScrollLeftChange).toHaveBeenCalledWith(30);
            expect(model._getMaxCollectionLength).not.toHaveBeenCalled();
            expect(model._onScrollTopChange).not.toHaveBeenCalled();
        });
        it('rowHeight 변경의 경우 _getMaxCollectionLength 를 호출한다.', function() {
            model._onChange({
                key: 'rowHeight',
                value: 40
            });
            expect(model._getMaxCollectionLength).toHaveBeenCalled();
            expect(model._onScrollLeftChange).not.toHaveBeenCalled();
            expect(model._onScrollTopChange).not.toHaveBeenCalled();
        });
    });
    describe('_onScrollLeftChange', function() {
        it('0 보다 작을경우 0 을 세팅한다.', function() {
            model._onScrollLeftChange(-10);
            expect(model.scrollLeft).toBe(0);
        });

    });
    describe('_onScrollTopChange', function() {
        it('maxScrollTop 보다 클 경우 scrollTop 값을 maxScrollTop 으로 설정한다.', function() {
            model.maxScrollTop = 30;
            model._onScrollTopChange(31);
            expect(model.scrollTop).toBe(30);
        });

        it('0 보다 작을 경우 0으로 설정한다.', function() {
            model._onScrollTopChange(-1);
            expect(model.scrollTop).toBe(0);
        });
    });
    describe('set', function() {
        it('문제없이 설정한다.', function() {
            model.set('param1', 1);
            expect(model.param1).toBe(1);
        });
        it('첫번째 인자가 object 형태이면 복수의 property 를 설정한다.', function() {
            model.set({
                'param1': 1,
                'param2': 2
            });
            expect(model.param1).toBe(1);
            expect(model.param2).toBe(2);
        });
        it('값이 다를때 change 이벤트를 발생한다.', function() {
            var callback = jasmine.createSpy('callback');
            model.set({
                'param1': 1,
                'param2': 2
            });
            model.on('change', callback);
            model.set({
                'param1': 1,
                'param2': 2
            });
            expect(callback).not.toHaveBeenCalled();
            model.set({
                'param1': 3,
                'param2': 4
            });
            expect(callback.calls.count()).toBe(2);

            expect(model.param1).toBe(3);
            expect(model.param2).toBe(4);
        });
    });
    describe('_onCollectionChange', function() {
        describe('collection 의 clear, prepend, set, append 를 호출시 refresh 한다.', function() {
            it('refresh 를 확인한다.', function() {
                model._refresh = jasmine.createSpy('refresh');
                model.collection.set([1, 2, 3, 4]);
                expect(model._refresh.calls.count()).toBe(1);

                model.collection.append([1, 2, 3, 4]);
                expect(model._refresh.calls.count()).toBe(2);

                model.collection.prepend([1, 2, 3, 4]);
                expect(model._refresh.calls.count()).toBe(3);

                model.collection.clear();
                expect(model._refresh.calls.count()).toBe(4);
            });
        });
    });
    describe('_doFreeze', function() {
        beforeEach(function() {
            model.freeze = true;
            model.rowHeight = 20;
            model.collection.set([1, 2, 3, 4]);
        });
        it('추가된 데이터와 관계없이 현재 scroll 위치를 유지하기 위해 maxScrollTop 과 scrollTop 값을 적절히 잘 설정한다.', function() {
            model._doFreeze([1, 2]);
            expect(model.maxScrollTop).toBe(85);
            expect(model.scrollTop).toBe(43);
        });
    });
});
