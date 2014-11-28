    /**
     * @fileoverview 원본 Data를 한번 가공하여 View 에서 사용할 수 있는 데이터 구조를 담고 있는 클래스 모음
     * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
     */
    /**
     * View 에서 참조하여 rendering 하도록, 원본 데이터를 가공한 render model
     * @constructor Focus
     */
    var Focus = ne.util.defineClass(Base, /**@lends Focus.prototype */{
        init: function(attributes) {
            Base.prototype.init.apply(this, arguments);
            this.setOwnProperties({
                selectMap: {},
                isMultiple: attributes.isMultiple || false
            });
        },
        getSelectList: function() {
            var selectList = [];
            ne.util.forEach(this.selectMap, function(val, key) {
                selectList.push(key);
            }, this);
            return selectList;
        },
        select: function(key) {
            if (!this.isMultiple) {
                ne.util.forEach(this.selectMap, function(value, key) {
                    this.unselect(key);
                }, this);
            }
            this.selectMap[key] = true;
            this.fire('select', key, this.selectMap);
        },
        /**
         *
         * @param {(String|Number)} [key] 지정되지 않았다면 모든 select 를 초기화한다.
         */
        unselect: function(key) {
            this.selectMap[key] = null;
            delete this.selectMap[key];
            this.fire('unselect', key, this.selectMap);
        }
    });