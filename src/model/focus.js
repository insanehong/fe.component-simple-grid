    /**
     * @fileoverview 원본 Data를 한번 가공하여 View 에서 사용할 수 있는 데이터 구조를 담고 있는 클래스 모음
     * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
     */
    /**
     * View 에서 참조하여 rendering 하도록, 원본 데이터를 가공한 render model
     * @constructor Focus
     */
    var Focus = ne.util.defineClass(Base, /**@lends Focus.prototype */{
        /**
         * 초기화
         * @param {Object} options
         *      @param {Boolean} [options.isMultiple=false] 다중 선택할지 여부
         */
        init: function(options) {
            Base.prototype.init.apply(this, arguments);
            this.setOwnProperties({
                selectMap: {},
                isMultiple: options && options.isMultiple || false
            });
        },

        /**
         * 선택된 영역의 list 를 반환한다.
         * @return {Array}  선택 영역의 list
         */
        getSelectList: function() {
            return ne.util.keys(this.selectMap);
        },

        /**
         * 행을 선택한다.
         * @param {(Number|String)} key 해당하는 row의 키값
         */
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
         * 행을 선택 해제한다.
         * @param {(String|Number)} [key] 지정되지 않았다면 모든 select 를 초기화한다.
         */
        unselect: function(key) {
            if (ne.util.isUndefined(key)) {
                ne.util.forEach(this.selectMap, function(val, key) {
                    this.unselect(key);
                }, this);
            } else {
                this.selectMap[key] = null;
                delete this.selectMap[key];
                this.fire('unselect', key, this.selectMap);
            }
        }
    });
