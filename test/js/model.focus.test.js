describe('view.selection', function() {
    var focus;
    beforeEach(function() {
        focus = new Focus();
    });
    afterEach(function() {
        focus = null;
    });
    describe('select', function() {
        describe('multiple 설정이 없을 경우 ', function() {
            it('selectMap 을 무조건 단일로 설정한다.', function() {
                focus.select(3);
                expect(focus.selectMap).toEqual({3: true});
                focus.select(4);
                expect(focus.selectMap).toEqual({4: true});
            });
        });
        describe('multiple 설정이 있을 경우 ', function() {
            it('다수의 selectionMap 을 설정한다..', function() {
                focus.isMultiple = true;
                focus.select(3);
                expect(focus.selectMap).toEqual({3: true});
                focus.select(4);
                expect(focus.selectMap).toEqual({3: true, 4: true});
                focus.select(5);
                expect(focus.selectMap).toEqual({3: true, 4: true, 5: true});
            });
        });
    });
    describe('unselect', function() {
        beforeEach(function() {
            focus.isMultiple = true;
            focus.select(3);
            focus.select(4);
            focus.select(5);
        });
        it('인자가 없을 경우 select 된 모든 정보를 삭제한다.', function() {
            focus.unselect();
            var selectList = focus.getSelectList();
            expect(selectList.length).toBe(0);
            expect(focus.selectMap).toEqual({});
        });
        it('인자가 있을경우 해당 select 정보만 삭제한다...', function() {
            focus.unselect(3);
            var selectList = focus.getSelectList();
            expect(selectList).toEqual(['4', '5']);
            expect(focus.selectMap).toEqual({4: true, 5: true});
        });
    });
});