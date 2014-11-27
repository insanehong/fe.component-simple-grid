/**
 * @fileoverview 원본데이터 콜렉션 클래스
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * 원본 데이터 collection
 * @constructor Collection
 */
var Collection = ne.util.defineClass(Base, /**@lends Collection.prototype */{
        init: function() {
            Base.prototype.init.apply(this, arguments);
            this.setOwnProperties({
                maxLength: 0,
                list: [],
                map: {},
                length: 0,
                idx: 0,
                worker: new Worker()
            });

            this.on('change', this._onChange, this);
        },
        /**
         * 사용자 action 이 발생했을 때에 데이터 상태보존을 위해 lock 한다.
         */
        lock: function() {
           this.worker.lock();
        },
        /**
         * 사용자 action 이 종료되면 lock 을 해제하고 적재된 명령을 한번에 수행한다.
         */
        unlock: function() {
            this.worker.unlock();
        },
        /**
         * 데이터가 set 을 사용하여 변경되었을 때, 이벤트 핸들러
         * @private
         */
        _onChange: function() {
            this.length = this.list.length;
        },
        /**
         * collection 값을 설정한다.
         * @param {Array} list
         */
        set: function(list) {
            this.worker.enqueue(this._set, arguments, this);
        },
        /**
         * set enqueue 할 내부 함수
         * @param {Array} list
         * @private
         */
        _set: function(list) {
            this.list = this._getFormattedList(list);
            if (this.maxLength > 0 && this.list.length > this.maxLength) {
                this._removeMap(0, this.list.length - this.maxLength);
                this.list = this.list.slice(this.list.length - this.maxLength, this.list.length);
            }
            this.invoke('change', {
                'type' : 'set',
                'list' : list
            });
        },
        /**
         * 사용하지 않는 Map 을 제거한다.
         * @param {number} start
         * @param {number} end
         * @private
         */
        _removeMap: function(start, end) {
            var i,
                id;
            for (i = start; i < end; i++) {
                id = this.list[i].id;
                this.map[id] = undefined;
                delete this.map[id];
            }
        },
        /**
         * 배열을 collection 에 맞는 형태로 가공하여 map 에 저장하고, 가공된 배열을 반환한다.
         * @param {Array} list
         * @return {Array}
         * @private
         */
        _getFormattedList: function(list) {
            var obj,
                formattedList = [];

            ne.util.forEachArray(list, function(data) {
                obj = {
                    id: this.idx++,
                    data: data
                };
                formattedList.push(obj);
                this.map[obj.id] = obj;
            }, this);
            return formattedList;
        },

        /**
         * 배열에서 index 에 해당하는 데이터를 반환한다.
         * @param {number} index
         * @return {*}
         */
        at: function(index) {
            return this.list[index];
        },
        /**
         * 맵에서 id 에 해당하는 데이터를 반환한다.
         * @param {(number|string)} id
         * @return {*}
         */
        get: function(id) {
            return this.map[id];
        },
        /**
         * 데이터를 입력받아 데이터가 존재하는 index 를 반환한다.
         * @param {object} obj
         * @return {number}
         */
        indexOf: function(obj) {
            var index = -1;
            if (!(obj && obj.id !== undefined)) {
                return -1;
            } else {

                ne.util.forEachArray(this.list, function(data, i) {
                    if (data && data.id == obj.id) {
                        console.log(this.list, data.id, i);
                        index = i;
                        return false;
                    }
                }, this);
                console.log('beforeReturn', index);
                return index;
            }

        },
        /**
         * collection 에 data Array 를  append 한다.
         * @param {Array} list
         */
        append: function(list) {
            this.worker.enqueue(this._append, arguments, this);
        },
        /**
         * append enqueue 할 내부 함수
         * @param {Array} list
         * @private
         */
        _append: function(list) {
            list = this._getFormattedList(list);
            this.list = this.list.concat(list);
            if (this.maxLength > 0 && this.list.length > this.maxLength) {
                this._removeMap(0, this.list.length - this.maxLength);
                this.list = this.list.slice(this.list.length - this.maxLength, this.list.length);
            }
            this.invoke('change', {
                type: 'append',
                list: this.list,
                appended: list
            });
        },
        /**
         * collection 에 data Array 를  prepend 한다.
         * @param {Array} list
         */
        prepend: function(list) {
            this.worker.enqueue(this._prepend, arguments, this);
        },
        /**
         * prepend enqueue 할 내부 함수
         * @param {Array} list
         * @private
         */
        _prepend: function(list) {
            list = this._getFormattedList(list);
            this.list = list.concat(this.list);
            if (this.maxLength > 0 && this.list.length > this.maxLength) {
                this._removeMap(this.maxLength, this.list.length);
                this.list = this.list.slice(0, this.maxLength);
            }

            this.invoke('change', {
                type: 'prepend',
                list: this.list,
                prepended: list
            });
        },
        /**
         * collection 을 초기화한다.
         */
        clear: function() {
            this.worker.enqueue(this._clear, arguments, this);
        },
        /**
         * clear enqueue 할 내부 함수
         * @private
         */
        _clear: function() {
            this.list = [];
            this.map = {};
            this.invoke('change', {
                type: 'clear',
                list: this.list,
                idx: 0
            });
        }
    });

