'use strict';
describe('data.collection 테스트', function() {
    var instance;
    beforeEach(function() {
        instance = new Collection();
    });
    describe('데이터 변경 테스트', function() {
        describe('_getFormattedList', function() {
            it('list 를 넘기면 formatted 된 object list 를 반환하고 내부적으로 map 을 생성한다.', function() {
                var list = instance._getFormattedList(['a', 'b']);
                expect(list[0].id).toBe(0);
                expect(list[0].data).toBe('a');
                expect(list[0]).toEqual(instance.map[0]);
                expect(list[1].id).toBe(1);
                expect(list[1].data).toBe('b');
                expect(list[1]).toEqual(instance.map[1]);
            });
        });
        describe('set 을 사용해 data 를 세팅', function() {
            var callback;
            beforeEach(function() {
                callback = jasmine.createSpy('callback');
                instance.on('change', callback);
            });
            it('list 를 생성하고 change 이벤트를 발생한다.', function() {
                instance.set([0, 1, 2, 3, 4]);
                expect(instance.list.length).toBe(5);
                expect(callback).toHaveBeenCalled();
            });
            it('내부 변수 length 를 업데이트한다.', function() {
                instance.set([0, 1, 2, 3, 4]);
                expect(instance.length).toBe(5);
            });
            it('maxLength 를 벗어나면 앞의 데이터를 제거한다.', function() {
                instance.maxLength = 2;
                instance.set([0, 1, 2, 3, 4]);
                expect(instance.length).toBe(2);
                expect(instance.list[0]).toEqual({
                    id: 3,
                    data: 3
                });
                expect(instance.list[1]).toEqual({
                    id: 4,
                    data: 4
                });
            });
        });
        describe('Data 조회', function() {
            beforeEach(function() {
                instance.maxLength = 2;
                instance.set([0, 1, 2, 3, 4]);
            });
            it('at 으로 index 에 해당하는 데이터를 조회한다.', function() {
                expect(instance.at(0)).toEqual({
                    id: 3,
                    data: 3
                });
                expect(instance.at(1)).toEqual({
                    id: 4,
                    data: 4
                });
                expect(instance.at(3)).not.toBeDefined();
            });
            it('get 으로 index 에 해당하는 데이터를 조회한다.', function() {
                expect(instance.get(3)).toEqual({
                    id: 3,
                    data: 3
                });
                expect(instance.get(4)).toEqual({
                    id: 4,
                    data: 4
                });
                expect(instance.get(0)).not.toBeDefined();
                expect(instance.get(1)).not.toBeDefined();
                expect(instance.get(2)).not.toBeDefined();
            });
            it('indexOf 으로 해당 data 의 index 를 조회한다.', function() {
                var first = instance.get(3),
                    second = instance.get(4);

                expect(instance.indexOf(first)).toBe(0);
                expect(instance.indexOf(second)).toBe(1);
                expect(instance.indexOf({})).toBe(-1);
            });
        });
        describe('append', function() {
            beforeEach(function() {
                instance.set([0, 1, 2, 3, 4]);
            });
            it('append 를 사용하여 마지막에 데이터를 추가한다.', function() {
                instance.append([5, 6]);
                expect(instance.at(0).data).toBe(0);
                expect(instance.at(1).data).toBe(1);
                expect(instance.at(2).data).toBe(2);
                expect(instance.at(3).data).toBe(3);
                expect(instance.at(4).data).toBe(4);
                expect(instance.at(5).data).toBe(5);
                expect(instance.at(6).data).toBe(6);

                expect(instance.at(0).id).toBe(0);
                expect(instance.at(1).id).toBe(1);
                expect(instance.at(2).id).toBe(2);
                expect(instance.at(3).id).toBe(3);
                expect(instance.at(4).id).toBe(4);
                expect(instance.at(5).id).toBe(5);
                expect(instance.at(6).id).toBe(6);

                expect(instance.length).toBe(7);
            });
            it('maxLength 에 걸릴경우 앞쪽의 데이터를 제거한다.', function() {
                instance.maxLength = 5;
                instance.append([5, 6]);
                expect(instance.at(0).data).toBe(2);
                expect(instance.at(1).data).toBe(3);
                expect(instance.at(2).data).toBe(4);
                expect(instance.at(3).data).toBe(5);
                expect(instance.at(4).data).toBe(6);
                expect(instance.at(5)).not.toBeDefined();
                expect(instance.at(6)).not.toBeDefined();

                expect(instance.at(0).id).toBe(2);
                expect(instance.at(1).id).toBe(3);
                expect(instance.at(2).id).toBe(4);
                expect(instance.at(3).id).toBe(5);
                expect(instance.at(4).id).toBe(6);
                expect(instance.at(5)).not.toBeDefined();
                expect(instance.at(6)).not.toBeDefined();

                expect(instance.get(0)).not.toBeDefined();
                expect(instance.get(1)).not.toBeDefined();

                expect(instance.length).toBe(5);
            });
        });
        describe('prepend', function() {
            beforeEach(function() {
                instance.set([0, 1, 2, 3, 4]);
            });
            it('prepend 를 사용하여 앞에 데이터를 추가한다.', function() {
                instance.prepend([5, 6]);
                expect(instance.at(0).data).toBe(5);
                expect(instance.at(1).data).toBe(6);
                expect(instance.at(2).data).toBe(0);
                expect(instance.at(3).data).toBe(1);
                expect(instance.at(4).data).toBe(2);
                expect(instance.at(5).data).toBe(3);
                expect(instance.at(6).data).toBe(4);

                expect(instance.at(0).id).toBe(5);
                expect(instance.at(1).id).toBe(6);
                expect(instance.at(2).id).toBe(0);
                expect(instance.at(3).id).toBe(1);
                expect(instance.at(4).id).toBe(2);
                expect(instance.at(5).id).toBe(3);
                expect(instance.at(6).id).toBe(4);

                expect(instance.length).toBe(7);
            });
            it('maxLength 에 걸릴경우 뒷쪽의 데이터를 제거한다.', function() {
                instance.maxLength = 5;
                instance.prepend([5, 6]);
                expect(instance.at(0).data).toBe(5);
                expect(instance.at(1).data).toBe(6);
                expect(instance.at(2).data).toBe(0);
                expect(instance.at(3).data).toBe(1);
                expect(instance.at(4).data).toBe(2);
                expect(instance.at(5)).not.toBeDefined(3);
                expect(instance.at(6)).not.toBeDefined(4);

                expect(instance.at(0).id).toBe(5);
                expect(instance.at(1).id).toBe(6);
                expect(instance.at(2).id).toBe(0);
                expect(instance.at(3).id).toBe(1);
                expect(instance.at(4).id).toBe(2);
                expect(instance.at(5)).not.toBeDefined(3);
                expect(instance.at(6)).not.toBeDefined(4);

                expect(instance.get(3)).not.toBeDefined();
                expect(instance.get(4)).not.toBeDefined();

                expect(instance.length).toBe(5);
            });
        });
        describe('clear', function() {
            it('데이터를 제거하고 내부 변수를 초기화한다.', function() {
                instance.clear();
                expect(instance.list.length).toBe(0);
                expect(instance.map).toEqual({});
                expect(instance.length).toBe(0);
            });
        });
    });

});
