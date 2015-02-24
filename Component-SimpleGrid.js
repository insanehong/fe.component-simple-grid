/*!SimpleGrid v1.0.0 | NHN Entertainment*/
(function() {
/**********
 * ajax.js
 **********/

/**
 * @fileoverview
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    var ajax = {};

    /**
     * Ajax 요청 정보 저장 객체
     * @property _ajaxRequestData
     * @private
     * @type {DataObject}
     */
    ajax._ajaxRequestData = {};
    /**
     * 공통 Ajax 처리 함수
     * @method ajax
     * @param {String} api urlCode 페이지 코드 (pug.variables._url에 저장된 값) 혹은 API URL 직접 입력
     * @param {DataObject} options Ajax 요청 옵션 객체
     * 		@param {DataObject} [options.data] Ajax 요청 시 함께 전달할 파라미터 객체
     * 		@param {String} [options.type="post"] ajax 요청 형식
     * 		@param {String} [options.dataType="json"] ajax 응답받을 데이터 형식
     * 		@param {Funtion} [options.complete] 전송이 완료되었을 시 실행될 콜백함수
     * 		@param {Funtion} [options.success] 전송이 성공하였을 시 실행될 콜백함수
     * 		@param {Funtion} [options.error] 전송이 실패하였을 시 실행될 콜백함수
     * - $Ajax() 옵션 그대로 사용가능<br />
     * - 추가적인 옵션<br />
     *  bNotUseErrorAlert : Ajax 통신 중에, 에러가 발생하더라도, 얼럿을 띄우지 않도록 할 경우 true로 설정
     *  sResultType : 응답 포맷
     * @return {Object} $Ajax() 객체
     * @example
     * ne.util.ajax.request(url, {
     *	 "action" : "insertList",
     *	 "page" : 3
     *	 "success" : function(responseData, status, jqXHR){
     *		console.log("응답 데이터 : ", responseData.myData);
     *	 }
     * });
     */
    ajax.request = function(api, options) {
        // Ajax 요청을 할 API 설정
        var url = api;
        if (url) {
            // 랜덤 아이디 생성
            var randomId = ajax.util._getRandomId();

            // Ajax 요청용 파라미터 객체 설정
            options = options || {};
            options._complete = options.complete;
            options._success = options.success;
            options._error = options.error;
            options = $.extend(options, {
                url: url,
                data: options.data || {},
                type: options.type || 'post',
                dataType: options.dataType || 'json',
                complete: $.proxy(this._onAjaxComplete, this, randomId),
                success: $.proxy(this._onAjaxSuccess, this, randomId),
                error: $.proxy(this._onAjaxError, this, randomId)
            });

            // 중복된 요청일 경우 요청 중단
            var isMatchedURL,
                isExistJSON,
                x;
            for (x in this._ajaxRequestData) {
                isMatchedURL = options.url === this._ajaxRequestData[x].url;
                isExistJSON = ne.util.compareJSON(this._ajaxRequestData[x].data, options.data);
                if (isMatchedURL && isExistJSON) {
                    return false;
                }
            }

            // 요청 정보를 저장
            this._ajaxRequestData[randomId] = ajax.util.cloningObject(options);
            $.ajax(options);
        } else {
            alert('요청을 보낼 URL을 입력해 주시기 바랍니다.');
            return false;
        }
    };

    /**
     * ajax 전송이 완료되었을 때 실행되는 콜백함수
     * - Ajax 요청이 완료되었을 때 수행되며, HTTP 상태 코드와 서버에서의 응답 결과에 따라 공통된 처리를 수행한다.
     * - Ajax 요청 시, 사용자가 등록한 콜백이 있으면 실행한다.
     *
     * @method _onAjaxComplete
     * @param {String} requestKey Ajax 요청에 대한 고유 아이디
     * @param {jqXHR} jqXHR Ajax 응답 객체
     * @param {String} status Ajax 응답 status
     * @private
     */
    ajax._onAjaxComplete = function(requestKey, jqXHR, status) {
        var requestData = this._ajaxRequestData[requestKey];
        if (requestData) {
            if (requestData['_complete'] && $.isFunction(requestData['_complete'])) {
                requestData['_complete'](status, jqXHR);
            }
            delete this._ajaxRequestData[requestKey];
        } else {
            throw new Error('Ajax 요청 정보가 없습니다.');
        }
    };

    /**
     * ajax 전송이 성공하였을 때 실행되는 콜백함수
     * - 응답값의 result가 true일 때 실행된다
     * - Ajax 요청이 완료되었을 때 수행되며, HTTP 상태 코드와 서버에서의 응답 결과에 따라 공통된 처리를 수행한다.
     * - Ajax 요청 시, 사용자가 등록한 콜백이 있으면 실행한다.
     *
     * @method _onAjaxSuccess
     * @param {String} requestKey Ajax 요청에 대한 고유 아이디
     * @param {DataObject} responseData Ajax 응답받은 데이터
     * 		@param {Boolean} [responseData.result] 정상적인 응답결과인지 여부
     * 		@param {String} [responseData.data.message] 정의되어 있을 경우, 이 문자열로 시스템얼럿 발생
     * 		@param {String} [responseData.data.redirectUrl] 이동시킬 url, 있을 경우 리다이렉트 처리
     * 		@param {Boolean} [responseData.data.closeWindow] 창 닫을지 여부, true일 경우 현재창 닫음
     * @param {String} status Ajax 응답 status
     * @param {jqXHR} jqXHR Ajax 응답 객체
     * @private
     */
    ajax._onAjaxSuccess = function(requestKey, responseData, status, jqXHR) {
        var requestData = this._ajaxRequestData[requestKey];
        if (requestData) {
            var result = true;
            if (requestData['_success'] && $.isFunction(requestData['_success'])) {
                result = requestData['_success'](responseData, status, jqXHR);
            }
            if (result !== false && responseData && responseData.data) {
                if (responseData.data.message) {
                    alert(responseData.data.message);
                }

                if (responseData.data.redirectUrl) {
                    location.href = responseData.data.redirectUrl;
                }

                if (responseData.data.closeWindow) {
                    ajax.util.close(true);
                }
            }
        } else {
            throw new Error('Ajax 요청 정보가 없습니다.');
        }
    };

    /**
     * ajax 전송이 성공하였을 때 실행되는 콜백함수
     * - 응답값의 result가 false일 때 실행된다
     * - Ajax 요청이 완료되었을 때 수행되며, HTTP 상태 코드와 서버에서의 응답 결과에 따라 공통된 처리를 수행한다.
     * - Ajax 요청 시, 사용자가 등록한 콜백이 있으면 실행한다.
     *
     * @method _onAjaxError
     * @param {String} requestKey Ajax 요청에 대한 고유 아이디
     * @param {jqXHR} jqXHR Ajax 응답 객체
     * @param {String} status Ajax 응답 status
     * @param {String} errorMessage 서버로부터 전달받은 에러메세지
     * @private
     */
    ajax._onAjaxError = function(requestKey, jqXHR, status, errorMessage){
        var requestData = this._ajaxRequestData[requestKey];
        if (requestData) {
            var result = true;
            if (requestData['_error'] && $.isFunction(requestData['_error'])) {
                result = requestData['_error'](jqXHR, status, errorMessage);
            }
        } else {
            throw new Error('Ajax 요청 정보가 없습니다.');
        }
    };

    /**
     * @modules ne.util.ajax.util
     */

    ajax.util = {};
    /**
     * 객체를 복제하여 돌려준다.
     *
     * @param {*} sourceTarget 복제할 대상
     * @returns {*}
     */
    ajax.util.cloningObject = function(sourceTarget) {
        var constructor,
            destinationTarget,
            x, y;

        if (typeof sourceTarget === 'object' && (constructor = this.getConstructorName(sourceTarget))) {
            destinationTarget = eval('new ' + constructor + '()');

            if (sourceTarget.prototype) {
                for (x in sourceTarget.prototype) {
                    destinationTarget.prototype[x] = this.cloningObject(sourceTarget.prototype[x]);
                }
            }

            for (y in sourceTarget) {
                if (sourceTarget[y] instanceof RegExp) {
                    destinationTarget[y] = eval(sourceTarget[y].toString());
                } else {
                    destinationTarget[y] = this.cloningObject(sourceTarget[y]);
                }
            }
            return destinationTarget;
        }

        destinationTarget = sourceTarget;
        return destinationTarget;
    };

    /**
     * 클래스의 이름을 문자열로 가져온다.
     *
     * @param {*} target constructor를 체크 할 오브젝트
     * @returns {String|null}
     */
    ajax.util.getConstructorName = function(target) {
        if (target && target.constructor) {
            var code = target.constructor.toString();
            var match = code.match(/function ([^\(]*)/);
            return (match && match[1]) || null;
        }
        return null;
    };

    /**
     * 랜덤한 문자열을 생성하는 함수
     *
     * @private
     * @return {String} 랜덤값
     */
    ajax.util._getRandomId = function() {
        return String(parseInt(Math.random() * 10000000000, 10));
    };

    /**
     * 닫기를 실행, 대상이 엘리먼트이면 이벤트 제거만 수행
     *
     * @param {*} skipBeforeUnload
     * @param popup
     */
    ajax.util.close = function(skipBeforeUnload, popup) {
        var target = popup || window;

        if (ne.util.isTruthy(skipBeforeUnload)) {
            $(target).off('beforeunload');
        }

        if (!target.closed) {
            target.opener = window.location.href;
            target.close();
        }

    };

    ne.util.ajax = ajax;

})(window.ne);

/**********
 * browser.js
 **********/

/**
 * @fileoverview 클라이언트의 브라우저의 종류와 버전 검출을 위한 모듈
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 다음의 브라우저에 한하여 종류와 버전을 제공하는 모듈
     *
     * - ie7 ~ ie11
     * - chrome
     * - firefox
     * - safari
     *
     * @module browser
     * @example
     * if (browser.msie && browser.version === 7) {
     *     // IE7일 경우의 루틴
     * }
     *
     * if (browser.chrome && browser.version >= 32) {
     *     // Chrome 32버전 이상일 때의 루틴
     * }
     */
    var browser = {
        chrome: false,
        firefox: false,
        safari: false,
        msie: false,
        others: false,
        version: 0
    };

    var nav = window.navigator,
        appName = nav.appName.replace(/\s/g, '_'),
        userAgent = nav.userAgent;

    var rIE = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})'),
        rIE11 = /Trident.*rv\:11\./,
        versionRegex = {
            'firefox': /Firefox\/(\d+)\./,
            'chrome': /Chrome\/(\d+)\./,
            'safari': /Version\/([\d\.]+)\sSafari\/(\d+)/
        };

    var key, tmp;

    var detector = {
        'Microsoft_Internet_Explorer': function() {
            // ie8 ~ ie10
            browser.msie = true;
            browser.version = parseFloat(userAgent.match(rIE)[1]);
        },
        'Netscape': function() {
            var detected = false;

            if (rIE11.exec(userAgent)) {
                // ie11
                browser.msie = true;
                browser.version = 11;
            } else {
                // chrome, firefox, safari, others
                for (key in versionRegex) {
                    if (versionRegex.hasOwnProperty(key)) {
                        tmp = userAgent.match(versionRegex[key]);
                        if (tmp && tmp.length > 1) {
                            browser[key] = detected = true;
                            browser.version = parseFloat(tmp[1] || 0);
                            break;
                        }
                    }
                }
            }

            // 브라우저 검출 실패 시 others로 표기
            if (!detected) {
                browser.others = true;
            }
        }
    };

    detector[appName]();

    ne.util.browser = browser;

})(window.ne);

/**********
 * collection.js
 **********/

/**
 * @fileoverview 객체나 배열을 다루기위한 펑션들이 정의 되어있는 모듈
 * @author FE개발팀
 * @dependency type.js, object.js
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 배열나 유사배열를 순회하며 콜백함수에 전달한다.
     * 콜백함수가 false를 리턴하면 순회를 종료한다.
     * @param {Array} arr
     * @param {Function} iteratee  값이 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @example
     *
     * var sum = 0;
     *
     * forEachArray([1,2,3], function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     */
    function forEachArray(arr, iteratee, context) {
        var index = 0,
            len = arr.length;

        for (; index < len; index++) {
            if (iteratee.call(context || null, arr[index], index, arr) === false) {
                break;
            }
        }
    }


    /**
     * obj에 상속된 프로퍼티를 제외한 obj의 고유의 프로퍼티만 순회하며 콜백함수에 전달한다.
     * 콜백함수가 false를 리턴하면 순회를 중료한다.
     * @param {object} obj
     * @param {Function} iteratee  프로퍼티가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @example
     * var sum = 0;
     *
     * forEachOwnProperties({a:1,b:2,c:3}, function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     **/
    function forEachOwnProperties(obj, iteratee, context) {
        var key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (iteratee.call(context || null, obj[key], key, obj) === false) {
                    break;
                }
            }
        }
    }

    /**
     * 파라메터로 전달된 객체나 배열를 순회하며 데이터를 콜백함수에 전달한다.
     * 유사배열의 경우 배열로 전환후 사용해야함.(ex2 참고)
     * 콜백함수가 false를 리턴하면 순회를 종료한다.
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @example
     *
     * //ex1)
     * var sum = 0;
     *
     * forEach([1,2,3], function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     *
     * //ex2) 유사 배열사용
     * function sum(){
     *     var factors = Array.prototype.slice.call(arguments); //arguments를 배열로 변환, arguments와 같은정보를 가진 새 배열 리턴
     *
     *     forEach(factors, function(value){
     *          ......
     *     });
     * }
     *
     **/
    function forEach(obj, iteratee, context) {
        var key,
            len;

        if (ne.util.isArray(obj)) {
            for (key = 0, len = obj.length; key < len; key++) {
                iteratee.call(context || null, obj[key], key, obj);
            }
        } else {
            ne.util.forEachOwnProperties(obj, iteratee, context);
        }
    }

    /**
     * 파라메터로 전달된 객체나 배열를 순회하며 콜백을 실행한 리턴값을 배열로 만들어 리턴한다.
     * 유사배열의 경우 배열로 전환후 사용해야함.(forEach example참고)
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @returns {Array}
     * @example
     * map([0,1,2,3], function(value) {
     *     return value + 1;
     * });
     *
     * => [1,2,3,4];
     */
    function map(obj, iteratee, context) {
        var resultArray = [];

        ne.util.forEach(obj, function() {
            resultArray.push(iteratee.apply(context || null, arguments));
        });

        return resultArray;
    }

    /**
     * 파라메터로 전달된 객체나 배열를 순회하며 콜백을 실행한 리턴값을 다음 콜백의 첫번째 인자로 넘겨준다.
     * 유사배열의 경우 배열로 전환후 사용해야함.(forEach example참고)
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @returns {*}
     * @example
     * reduce([0,1,2,3], function(stored, value) {
     *     return stored + value;
     * });
     *
     * => 6;
     */
    function reduce(obj, iteratee, context) {
        var keys,
            index = 0,
            length,
            store;


        if (!ne.util.isArray(obj)) {
            keys = ne.util.keys(obj);
        }

        length = keys ? keys.length : obj.length;

        store = obj[keys ? keys[index++] : index++];

        for (; index < length; index++) {
            store = iteratee.call(context || null, store, obj[keys ? keys[index] : index]);
        }

        return store;
    }
    /**
     * 유사배열을 배열 형태로 변환한다.
     * - IE 8 이하 버전에서 Array.prototype.slice.call 이 오류가 나는 경우가 있어 try-catch 로 예외 처리를 한다.
     * @param {*} arrayLike 유사배열
     * @return {Array}
     * @example


     var arrayLike = {
        0: 'one',
        1: 'two',
        2: 'three',
        3: 'four',
        length: 4
    };
     var result = toArray(arrayLike);

     => ['one', 'two', 'three', 'four'];
     */
    function toArray(arrayLike) {
        var arr;
        try {
            arr = Array.prototype.slice.call(arrayLike);
        } catch (e) {
            arr = [];
            forEachArray(arrayLike, function(value) {
                arr.push(value);
            });
        }
        return arr;
    }

    /**
     * 파라메터로 전달된 객체나 어레이를 순회하며 콜백을 실행한 리턴값이 참일 경우의 모음을 만들어서 리턴한다.
     *
     * @param {*} obj 순회할 객체나 배열
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @returns {*}
     * @example
     * filter([0,1,2,3], function(value) {
     *     return (value % 2 === 0);
     * });
     *
     * => [0, 2];
     * filter({a : 1, b: 2, c: 3}, function(value) {
     *     return (value % 2 !== 0);
     * });
     *
     * => {a: 1, c: 3};
     */
    var filter = function(obj, iteratee, context) {
        var result = ne.util.isArray(obj) ? [] : {},
            value,
            key;

        if (!ne.util.isObject(obj) || !ne.util.isFunction(iteratee)) {
            throw new Error('wrong parameter');
        }

        ne.util.forEach(obj, function() {
            if (iteratee.apply(context || null, arguments)) {
                value = arguments[0];
                key = arguments[1];
                if (ne.util.isArray(obj)) {
                    result.push(value);
                } else {
                    result[key] = value;
                }
            }
        }, context);

        return result;
    };

    /**
     * 배열 내의 값을 찾아서 인덱스를 반환한다. 찾고자 하는 값이 없으면 -1 반환.
     * @param {*} value 배열 내에서 찾고자 하는 값
     * @param {array} array 검색 대상 배열
     * @param {number} fromIndex 검색이 시작될 배열 인덱스. 지정하지 않으면 기본은 0이고 전체 배열 검색.
     *
     * @return {number} targetValue가 발견된 array내에서의 index값
     * @example
     *
     *   var arr = ['one', 'two', 'three', 'four'];
     *   ne.util.inArray('one', arr, 3);
     *      => return -1;
     *
     *   ne.util.inArray('one', arr);
     *      => return 0
     */
    var inArray = function(value, array, fromIndex) {
        if (!ne.util.isArray(array)) {
            return -1;
        }

        if (Array.prototype.indexOf) {
            return Array.prototype.indexOf.call(array, value, fromIndex);
        }

        var i,
            index,
            arrLen = array.length;

        //fromIndex를 지정하되 array 길이보다 같거나 큰 숫자로 지정하면 오류이므로 -1을 리턴한다.
        if (ne.util.isUndefined(fromIndex)) {
            fromIndex = 0;
        } else if (fromIndex >= arrLen) {
            return -1;
        }

        //fromIndex값을 참고하여 배열을 순회할 시작index를 정한다.
        index = (fromIndex > -1) ? fromIndex : 0;

        //array에서 value 탐색하여 index반환
        for (i = index; i < arrLen; i++) {
            if (array[i] === value) {
                return i;
            }
        }

        return -1;
    };

    ne.util.forEachOwnProperties = forEachOwnProperties;
    ne.util.forEachArray = forEachArray;
    ne.util.forEach = forEach;
    ne.util.toArray = toArray;
    ne.util.map = map;
    ne.util.reduce = reduce;
    ne.util.filter = filter;
    ne.util.inArray = inArray;

})(window.ne);

/**********
 * customEvent.js
 **********/

/**
 * @fileoverview 옵저버 패턴을 이용하여 객체 간 커스텀 이벤트를 전달할 수 있는 기능을 제공하는 모듈
 * @author FE개발팀
 * @dependency type.js, collection.js object.js
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 이벤트 핸들러에 저장되는 단위
     * @typedef {object} eventItem
     * @property {object.<string, object>} eventObject
     * @property {function()} eventObject.fn 이벤트 핸들러 함수
     * @property {*} [eventObject.ctx] 이벤트 핸들러 실행 시 컨텍스트 지정가능
     */


    /**
     * 커스텀 이벤트 클래스
     * @constructor
     * @exports CustomEvents
     * @class
     */
    function CustomEvents() {

        /**
         * 이벤트 핸들러를 저장하는 객체
         * @type {object.<string, eventItem>}
         * @private
         */
        this._events = {};
    }

    var CustomEventMethod = /** @lends CustomEvents */ {
        /**
         * 인스턴스가 발생하는 이벤트에 핸들러를 등록하는 메서드
         * @param {(object|String)} types - 이벤트 타입 (타입과 함수 쌍으로 된 객체를 전달할 수도 있고 타입만
         * 전달할 수 있다. 후자의 경우 두 번째 인자에 핸들러를 전달해야 한다.)
         * @param {function()=} fn - 이벤트 핸들러 목록
         * @param {*=} context
         * @example
         * // 첫 번째 인자에 이벤트명:핸들러 데이터 객체를 넘긴 경우
         * instance.on({
         *     zoom: function() {},
         *     pan: function() {}
         * }, this);
         *
         * // 여러 이벤트를 한 핸들러로 처리할 수 있도록 함
         * instance.on('zoom pan', function() {});
         */
        on: function(types, fn, context) {
            this._toggle(true, types, fn, context);
        },

        /**
         * 인스턴스에 등록했던 이벤트 핸들러를 해제할 수 있다.
         * @param {(object|string)=} types 등록 해지를 원하는 이벤트 객체 또는 타입명. 아무 인자도 전달하지 않으면 모든 이벤트를 해제한다.
         * @param {Function=} fn 삭제할 핸들러, 핸들러를 전달하지 않으면 types 해당 이벤트가 모두 삭제된다.
         * @param {*=} context
         * @example
         * // zoom 이벤트만 해제
         * instance.off('zoom', onZoom);
         *
         * // pan 이벤트 해제 (이벤트 바인딩 시에 context를 넘겼으면 그대로 넘겨주어야 한다)
         * instance.off('pan', onPan, this);
         *
         * // 인스턴스 내 모든 이벤트 해제
         * instance.off();
         */
        off: function(types, fn, context) {
            if (!ne.util.isExisty(types)) {
                this._events = null;
                return;
            }

            this._toggle(false, types, fn, context);
        },

        /**
         * on, off 메서드의 중복 코드를 줄이기 위해 만든 on토글 메서드
         * @param {boolean} isOn
         * @param {(Object|String)} types - 이벤트 타입 (타입과 함수 쌍으로 된 객체를 전달할 수도 있고 타입만
         * 전달할 수 있다. 후자의 경우 두 번째 인자에 핸들러를 전달해야 한다.)
         * @param {function()=} fn - 이벤트 핸들러 목록
         * @param {*=} context
         * @private
         */
        _toggle: function(isOn, types, fn, context) {
            var methodName = isOn ? '_on' : '_off',
                method = this[methodName];

            if (ne.util.isObject(types)) {
                ne.util.forEachOwnProperties(types, function(handler, type) {
                    method.call(this, type, handler, fn);
                }, this);
            } else {
                types = types.split(' ');

                ne.util.forEach(types, function(type) {
                    method.call(this, type, fn, context);
                }, this);
            }
        },

        /**
         * 내부적으로 실제로 이벤트를 등록하는 로직을 담는 메서드.
         *
         * 옵션에 따라 이벤트를 배열에 등록하기도 하고 해시에 등록하기도 한다.
         *
         * 두개를 사용하는 기준:
         *
         * 핸들러가 이미 this바인딩이 되어 있고 핸들러를 사용하는 object가 같은 종류가 동시다발적으로 생성/삭제되는 경우에는 context인자를
         * 전달하여 해시의 빠른 접근 속도를 이용하는 것이 좋다.
         *
         * @param {(object.<string, function()>|string)} type - 이벤트 타입 (타입과 함수 쌍으로 된 객체를 전달할 수도 있고 타입만
         * 전달할 수 있다. 후자의 경우 두 번째 인자에 핸들러를 전달해야 한다.)
         * @param {function()} fn - 이벤트 핸들러
         * @param {*=} context
         * @private
         */
        _on: function(type, fn, context) {
            var events = this._events = this._events || {},
                contextId = context && (context !== this) && ne.util.stamp(context);

            if (contextId) {
                /*
                 context가 현재 인스턴스와 다를 때 context의 아이디로 내부의 해시에서 빠르게 해당 핸들러를 컨트롤 하기 위한 로직.
                 이렇게 하면 동시에 많은 이벤트를 발생시키거나 제거할 때 성능면에서 많은 이점을 제공한다.
                 특히 동시에 많은 엘리먼트들이 추가되거나 해제될 때 도움이 될 수 있다.
                 */
                var indexKey = type + '_idx',
                    indexLenKey = type + '_len',
                    typeIndex = events[indexKey] = events[indexKey] || {},
                    id = ne.util.stamp(fn) + '_' + contextId; // 핸들러의 id + context의 id

                if (!typeIndex[id]) {
                    typeIndex[id] = {
                        fn: fn,
                        ctx: context
                    };

                    // 할당된 이벤트의 갯수를 추적해 두고 할당된 핸들러가 없는지 여부를 빠르게 확인하기 위해 사용한다
                    events[indexLenKey] = (events[indexLenKey] || 0) + 1;
                }
            } else {
                // fn이 이미 this 바인딩이 된 상태에서 올 경우 단순하게 처리해준다
                events[type] = events[type] || [];
                events[type].push({fn: fn});
            }
        },

        /**
         * 실제로 구독을 해제하는 메서드
         * @param {(object|string)=} type 등록 해지를 원하는 핸들러명
         * @param {function} [fn]
         * @param {*} context
         * @private
         */
        _off: function(type, fn, context) {
            var events = this._events,
                indexKey = type + '_idx',
                indexLenKey = type + '_len';

            if (!events) {
                return;
            }

            var contextId = context && (context !== this) && ne.util.stamp(context),
                listeners,
                id;

            if (contextId) {
                id = ne.util.stamp(fn) + '_' + contextId;
                listeners = events[indexKey];

                if (listeners && listeners[id]) {
                    listeners[id] = null;
                    events[indexLenKey] -= 1;
                }

            } else if(!fn) {
                events[type] = null;
            } else {
                listeners = events[type];

                if (listeners) {
                    if(fn){
                        ne.util.forEach(listeners, function(listener, index) {
                            if (ne.util.isExisty(listener) && (listener.fn === fn)) {
                                listeners.splice(index, 1);
                                return true;
                            }
                        });
                    }
                }
            }
        },

        /**
         * 이벤트를 발생시키는 메서드
         *
         * 등록한 리스너들의 실행 결과를 boolean AND 연산하여
         *
         * 반환한다는 점에서 {@link CustomEvents#fire} 와 차이가 있다
         *
         * 보통 컴포넌트 레벨에서 before 이벤트로 사용자에게
         *
         * 이벤트를 취소할 수 있게 해 주는 기능에서 사용한다.
         * @param {string} type
         * @param {*...} data
         * @returns {*}
         * @example
         * // 확대 기능을 지원하는 컴포넌트 내부 코드라 가정
         * if (this.invoke('beforeZoom')) {    // 사용자가 등록한 리스너 결과 체크
         *     // 리스너의 실행결과가 true 일 경우
         *     // doSomething
         * }
         *
         * //
         * // 아래는 사용자의 서비스 코드
         * map.on({
         *     'beforeZoom': function() {
         *         if (that.disabled && this.getState()) {    //서비스 페이지에서 어떤 조건에 의해 이벤트를 취소해야한다
         *             return false;
         *         }
         *         return true;
         *     }
         * });
         */
        invoke: function(type, data) {
            if (!this.hasListener(type)) {
                return true;
            }

            var args = Array.prototype.slice.call(arguments, 1),
                events = this._events;

            if (!events) {
                return true;
            }

            var typeIndex = events[type + '_idx'],
                listeners,
                result = true;

            if (events[type]) {
                listeners = events[type].slice();

                ne.util.forEach(listeners, function(listener) {
                    if (listener.fn.apply(this, args) === false) {
                        result = false;
                    }
                }, this);
            }

            ne.util.forEachOwnProperties(typeIndex, function(eventItem) {
                if (eventItem.fn.apply(eventItem.ctx, args) === false) {
                    result = false;
                }
            });

            return result;
        },

        /**
         * 이벤트를 발생시키는 메서드
         * @param {string} type 이벤트 타입명
         * @param {(object|string)=} data 발생과 함께 전달할 이벤트 데이터
         * @return {*}
         * @example
         * instance.fire('move', { direction: 'left' });
         *
         * // 이벤트 핸들러 처리
         * instance.on('move', function(moveEvent) {
         *     var direction = moveEvent.direction;
         * });
         */
        fire: function(type, data) {
            this.invoke.apply(this, arguments);
            return this;
        },

        /**
         * 이벤트 핸들러 존재 여부 확인
         * @param {string} type 핸들러명
         * @return {boolean}
         */
        hasListener: function(type) {
            var events = this._events,
                existyFunc = ne.util.isExisty;

            return existyFunc(events) && (existyFunc(events[type]) || events[type + '_len']);
        },

        /**
         * 등록된 이벤트 핸들러의 갯수 반환
         * @param {string} type
         * @returns {number}
         */
        getListenerLength: function(type) {
            var events = this._events,
                lenKey = type + '_len',
                length = 0,
                types,
                len;

            if (!ne.util.isExisty(events)) {
                return 0;
            }

            types = events[type];
            len = events[lenKey];

            length += (ne.util.isExisty(types) && ne.util.isArray(types)) ? types.length : 0;
            length += ne.util.isExisty(len) ? len : 0;

            return length;
        },

        /**
         * 단발성 커스텀 이벤트 핸들러 등록 시 사용
         * @param {(object|string)} types 이벤트명:핸들러 객체 또는 이벤트명
         * @param {function()=} fn 핸들러 함수
         * @param {*=} context
         */
        once: function(types, fn, context) {
            var that = this;

            if (ne.util.isObject(types)) {
                ne.util.forEachOwnProperties(types, function(handler, type) {
                    this.once(type, handler, fn);
                }, this);

                return;
            }

            function onceHandler() {
                fn.apply(context, arguments);
                that.off(types, onceHandler, context);
            }

            this.on(types, onceHandler, context);
        }

    };

    CustomEvents.prototype = CustomEventMethod;
    CustomEvents.prototype.constructor = CustomEvents;

    /**
     * 커스텀 이벤트 기능을 믹스인할 때 사용하는 메서드
     * @param {function()} func 생성자 함수
     * @example
     * // 모델 클래스 변경 시 컨트롤러에게 알림을 주고 싶은데
     * // 그 기능을 모델 클래스 자체에게 주고 싶다
     * function Model() {}
     *
     * // 커스텀 이벤트 믹스인
     * ne.util.CustomEvents.mixin(Model);
     *
     * var model = new Model();
     *
     * model.on('changed', function() {}, this);
     */
    CustomEvents.mixin = function(func) {
        ne.util.extend(func.prototype, CustomEventMethod);
    };

    ne.util.CustomEvents = CustomEvents;

})(window.ne);

/**********
 * defineClass.js
 **********/

/**
 * @fileoverview 클래스와 비슷한방식으로 생성자를 만들고 상속을 구현할 수 있는 메소드를 제공하는 모듈
 * @author FE개발팀
 * @dependency inheritance.js, object.js
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 객체의 생성및 상속을 편하게 도와주는 메소드
     * @param {*} [parent] 상속받을 생성자.
     * @param {Object} props 생성할 생성자의프로토타입에 들어갈 멤버들
     * @param {Function} props.init 인스턴스가 생성될때 실행됨
     * @param {Object} props.static 생성자의 클래스 맴버형태로 들어갈 멤버들
     * @returns {*}
     * @example
     *
     * var Parent = defineClasss({
     *     init: function() {
     *         this.name = 'made by def';
     *     },
     *     method: function() {
     *         //..can do something with this
     *     },
     *     static: {
     *         staticMethod: function() {
     *              //..do something
     *         }
     *     }
     * });
     *
     * var Child = defineClass(Parent, {
     *     method2: function() {}
     * });
     *
     *
     * Parent.staticMethod();
     *
     * var parentInstance = new Parent();
     * console.log(parentInstance.name); //made by def
     * parentInstance.staticMethod(); // Error
     *
     *
     * var childInstance = new Child();
     * childInstance.method();
     * childInstance.method2();
     *
     *
     */
    var defineClass = function(parent, props) {
        var obj;

        if (!props) {
            props = parent;
            parent = null;
        }

        obj = props.init || function(){};

        parent && ne.util.inherit(obj, parent);

        if (props.hasOwnProperty('static')) {
            ne.util.extend(obj, props.static);
            delete props.static;
        }

        ne.util.extend(obj.prototype, props);

        return obj;
    };

    ne.util.defineClass = defineClass;

})(window.ne);

/**********
 * form.js
 **********/

/**
 * @fileoverview Form 엘리먼트 헨들링 메서드
 * @author FE개발팀
 * @dependency jquery-1.8.3.js, collection.js, type.js
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * form 의 input 요소 값을 설정하기 위한 객체
     */
    var setInput = {
        /**
         * radio type 의 input 요소의 값을 설정한다.
         * @param {HTMLElement} targetElement
         * @param {String} formValue
         */
        'radio': function(targetElement, formValue) {
            targetElement.checked = (targetElement.value === formValue);
        },
        /**
         * radio type 의 input 요소의 값을 설정한다.
         * @param {HTMLElement} targetElement
         * @param {String} formValue
         */
        'checkbox': function(targetElement, formValue) {
            if (ne.util.isArray(formValue)) {
                targetElement.checked = $.inArray(targetElement.value, _changeToStringInArray(formValue)) !== -1;
            } else {
                targetElement.checked = (targetElement.value === formValue);
            }
        },
        /**
         * select-one type 의 input 요소의 값을 설정한다.
         * @param {HTMLElement} targetElement
         * @param {String} formValue
         */
        'select-one': function(targetElement, formValue) {
            var options = ne.util.toArray(targetElement.options),
                index = -1;

            ne.util.forEach(options, function(targetOption, i) {
                if (targetOption.value === formValue || targetOption.text === formValue) {
                    index = i;
                    return false;
                }
            }, this);

            targetElement.selectedIndex = index;

        },
        /**
         * select-multiple type 의 input 요소의 값을 설정한다.
         * @param {HTMLElement} targetElement
         * @param {String|Array} formValue
         */
        'select-multiple': function(targetElement, formValue) {
            var options = ne.util.toArray(targetElement.options);

            if (ne.util.isArray(formValue)) {
                formValue = _changeToStringInArray(formValue);
                ne.util.forEach(options, function(targetOption) {
                    targetOption.selected = $.inArray(targetOption.value, formValue) !== -1 ||
                        $.inArray(targetOption.text, formValue) !== -1;
                }, this);
            } else {
                this['select-one'].apply(this, arguments);
            }
        },
        /**
         * input 요소의 값을 설정하는 default 로직
         * @param {HTMLElement} targetElement
         * @param {String} formValue
         */
        'defaultAction': function(targetElement, formValue) {
            targetElement.value = formValue;
        }
    };
    /**
     * 배열의 값들을 전부 String 타입으로 변환한다.
     * @private
     * @param {Array}  arr 변환할 배열
     * @return {Array} 변환된 배열 결과 값
     */
    function _changeToStringInArray(arr) {
        ne.util.forEach(arr, function(value, i) {
            arr[i] = String(value);
        }, this);
        return arr;
    }


    /**
     * $form 에 정의된 인풋 엘리먼트들의 값을 모아서 DataObject 로 구성하여 반환한다.
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @return {object} form 내의 데이터들을 key:value 형태의 DataObject 로 반환한다.
     **/
    function getFormData($form) {
        var result = {},
            valueList = $form.serializeArray();

        ne.util.forEach(valueList, function(obj) {
            var value = obj.value,
                name = obj.name;
            if (ne.util.isExisty(result[name])) {
                if (!result[name].push) {
                    result[name] = [result[name]];
                }
                result[name].push(value || '');
            } else {
                result[name] = value || '';
            }
        }, this);

        return result;
    }
    /**
     * 폼 안에 있는 모든 인풋 엘리먼트를 배열로 리턴하거나, elementName에 해당하는 인풋 엘리먼트를 리턴한다.
     * @method getFormElement
     * @param {jquery} $form jQuery()로 감싼 폼엘리먼트
     * @param {String} [elementName] 특정 이름의 인풋 엘리먼트만 가져오고 싶은 경우 전달하며, 생략할 경우 모든 인풋 엘리먼트를 배열 형태로 리턴한다.
     * @return {jQuery}  jQuery 로 감싼 엘리먼트를 반환한다.
     */
    function getFormElement($form, elementName) {
        var formElement;
        if ($form && $form.length) {
            if (elementName) {
                formElement = $form.prop('elements')[elementName + ''];
            } else {
                formElement = $form.prop('elements');
            }
        }
        return $(formElement);
    }
    /**
     * 파라미터로 받은 데이터 객체를 이용하여 폼내에 해당하는 input 요소들의 값을 설정한다.
     *
     * @method setFormData
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @param {Object} formData 폼에 설정할 폼 데이터 객체
     **/
    function setFormData($form, formData) {
        ne.util.forEachOwnProperties(formData, function(value, property) {
            setFormElementValue($form, property, value);
        }, this);
    }
    /**
     * elementName에 해당하는 인풋 엘리먼트에 formValue 값을 설정한다.
     * -인풋 엘리먼트의 이름을 기준으로 하기에 라디오나 체크박스 엘리먼트에 대해서도 쉽게 값을 설정할 수 있다.
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @param {String}  elementName 값을 설정할 인풋 엘리먼트의 이름
     * @param {String|Array} formValue 인풋 엘리먼트에 설정할 값으로 체크박스나 멀티플 셀렉트박스인 경우에는 배열로 설정할 수 있다.
     **/
    function setFormElementValue($form, elementName, formValue) {
        var type,
            elementList = getFormElement($form, elementName);

        if (!elementList) {
            return;
        }
        if (!ne.util.isArray(formValue)) {
            formValue = String(formValue);
        }
        elementList = ne.util.isHTMLTag(elementList) ? [elementList] : elementList;
        elementList = ne.util.toArray(elementList);
        ne.util.forEach(elementList, function(targetElement) {
            type = setInput[targetElement.type] ? targetElement.type : 'defaultAction';
            setInput[type](targetElement, formValue);
        }, this);
    }
    /**
     * input 타입의 엘리먼트의 커서를 가장 끝으로 이동한다.
     * @param {HTMLElement} target HTML input 엘리먼트
     */
    function setCursorToEnd(target) {
        target.focus();
        var length = target.value.length;

        if (target.setSelectionRange) {
            target.setSelectionRange(length, length);
        } else if (target.createTextRange) {
            var range = target.createTextRange();
            range.collapse(true);
            range.moveEnd('character', length);
            range.moveStart('character', length);
            range.select();
        }
    }

    ne.util.getFormElement = getFormElement;
    ne.util.getFormData = getFormData;
    ne.util.setFormData = setFormData;
    ne.util.setFormElementValue = setFormElementValue;
    ne.util.setCursorToEnd = setCursorToEnd;
})(window.ne);
/**********
 * func.js
 **********/

/**
 * @fileoverview 함수관련 메서드 모음
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 커링 메서드
     * @param {function()} fn
     * @param {*} obj - this로 사용될 객체
     * @return {function()}
     */
    function bind(fn, obj) {
        var slice = Array.prototype.slice;

        if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
        }

        /* istanbul ignore next */
        var args = slice.call(arguments, 2);

        /* istanbul ignore next */
        return function() {
            /* istanbul ignore next */
            return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
        };
    }

    ne.util.bind = bind;

})(window.ne);

/**********
 * hashMap.js
 **********/

/**
 * @fileoverview Hash Map을 구현한 모듈이 정의 되어있다.
 * @author FE개발팀
 * @dependency type, collection.js
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }
    
    /**
     * 해쉬맵에서 사용하는 데이터는 _MAPDATAPREFIX로 시작한다.
     * @type {string}
     * @private
     */
    var _MAPDATAPREFIX = 'å';

    /**
     * HashMap
     * 키/밸류로 데이터를 관리할수있다(자바의 hashMap과 유사)
     * 주의) length프로퍼티를 가지고있어 유사 배열을 length의 유무로 체크하는 로직에서 의도되지 않은 동작을 할수있다.
     * @param {Object} [obj] 인스턴스가 만들어질때 셋팅할 초기 데이터
     * @constructor
     * @example
     * var hm = new HashMap({
     *     'mydata': {
     *          'hello': 'imfine'
     *      },
     *     'what': 'time'
     * });
     */
    function HashMap(obj) {
        /**
         * 사이즈
         * @type {number}
         */
        this.length = 0;

        if (obj) {
            this.setObject(obj);
        }
    }

    /**
     * 키/밸류 혹은 Object를 전달하여 데이터를 셋팅한다.
     * @param {String|Object} key 키에 해당하는 스트링이나 객체
     * @param {*} [value] 데이터
     * @example
     * var hm = new HashMap();
     *
     * hm.set('key', 'value');
     * hm.set({
     *     'key1': 'data1',
     *     'key2': 'data2'
     * });
     */
    HashMap.prototype.set = function(key, value) {
        arguments.length === 2 ? this.setKeyValue(key, value) : this.setObject(key);
    };

    /**
     * 키/밸류로 데이터를 셋팅한다.
     * @param {String} key 키스트링
     * @param {*} value 데이터
     * @example
     * var hm = new HashMap();
     * hm.setKeyValue('key', 'value');
     */
    HashMap.prototype.setKeyValue = function(key, value) {
        if (!this.has(key)) {
            this.length += 1;
        }
        this[this.encodeKey(key)] = value;
    };

    /**
     * 객체로 데이터를 셋팅한다.
     * @param {Object} obj
     * @example
     * var hm = new HashMap();
     *
     * hm.setObject({
     *     'key1': 'data1',
     *     'key2': 'data2'
     * });
     */
    HashMap.prototype.setObject = function(obj) {
        var self = this;

        ne.util.forEachOwnProperties(obj, function(value, key) {
            self.setKeyValue(key, value);
        });
    };

    /**
     * 해쉬맵을 인자로 받아 병합한다.
     * @param {HashMap} hashMap
     */
    HashMap.prototype.merge = function(hashMap) {
        var self = this;

        hashMap.each(function(value, key) {
            self.setKeyValue(key, value);
        });
    };

    /**
     * 해쉬맵에서 사용할 키를 생성한다.
     * @param {String} key
     * @returns {string}
     * @private
     */
    HashMap.prototype.encodeKey = function(key) {
        return _MAPDATAPREFIX + key;
    };

    /**
     * 해쉬맵키에서 실제 키를 가져온다.
     * @param {String} key
     * @returns {String}
     * @private
     */
    HashMap.prototype.decodeKey = function(key) {
        var decodedKey = key.split(_MAPDATAPREFIX);
        return decodedKey[decodedKey.length-1];
    };

    /**
     * 키값을 전달하여 데이터를 반환한다.
     * @param {String} key
     * @returns {*}
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     *
     * hm.get('key') // value
     */
    HashMap.prototype.get = function(key) {
        return this[this.encodeKey(key)];
    };

    /**
     * 키를 전달하여 데이터가 존재하는지 체크한다.
     * @param {String} key
     * @returns {boolean}
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     *
     * hm.has('key') // true
     */
    HashMap.prototype.has = function(key) {
        return this.hasOwnProperty(this.encodeKey(key));
    };

    /**
     * 키나 키의 목록을 전달하여 데이터를 삭제한다.
     * @param {String...|String[]} key
     * @returns {String|String[]}
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     * hm.set('key2', 'value');
     *
     * //ex1
     * hm.remove('key');
     *
     * //ex2
     * hm.remove('key', 'key2');
     *
     * //ex3
     * hm.remove(['key', 'key2']);
     */
    HashMap.prototype.remove = function(key) {
        if (arguments.length > 1) {
            key = ne.util.toArray(arguments);
        }

        return ne.util.isArray(key) ? this.removeByKeyArray(key) : this.removeByKey(key);
    };

    /**
     * 키를 전달하여 데이터를 삭제한다.
     * @param {String} key
     * @returns {*|null} 삭제된 데이터
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     *
     * hm.removeByKey('key')
     */
    HashMap.prototype.removeByKey = function(key) {
        var data = this.has(key) ? this.get(key) : null;

        if (data !== null) {
            delete this[this.encodeKey(key)];
            this.length -= 1;
        }

        return data;
    };

    /**
     * 키의 목록을 전달하여 데이터를 삭제한다.
     * @param {String[]} keyArray
     * @returns {String[]} 삭제된 데이터
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     * hm.set('key2', 'value');
     *
     * hm.removeByKeyArray(['key', 'key2']);
     */
    HashMap.prototype.removeByKeyArray = function(keyArray) {
        var data = [],
            self = this;

        ne.util.forEach(keyArray, function(key) {
            data.push(self.removeByKey(key));
        });

        return data;
    };

    /**
     * 모든데이터를 지운다.
     */
    HashMap.prototype.removeAll = function() {
        var self = this;

        this.each(function(value, key) {
            self.remove(key);
        });
    };

    /**
     * 데이터를 순회하며 콜백에 전달해준다.
     * @param {Function} iteratee
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     * hm.set('key2', 'value');
     *
     * hm.each(function(value, key) {
     *     //do something...
     * });
     */
    HashMap.prototype.each = function(iteratee) {
        var self = this,
            flag;

        ne.util.forEachOwnProperties(this, function(value, key) {
            if (key.charAt(0) === _MAPDATAPREFIX) {
                flag = iteratee(value, self.decodeKey(key));
            }

            if (flag === false) {
                return flag;
            }
        });
    };

    /**
     * 저장된 키의 목록을 배열로 리턴해준다.
     * @returns {Array}
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     * hm.set('key2', 'value');
     *
     * hm.keys();  //['key', 'key2');
     */
    HashMap.prototype.keys = function() {
        var keys = [],
            self = this;

        this.each(function(value, key) {
            keys.push(self.decodeKey(key));
        });

        return keys;
    };

    /**
     * 조건을 체크하는 콜백을 전달받아 데이터를 전달해주고 콜백의 결과가 true인경우의 데이터를 모와 배열로 만들어 리턴해준다.
     * @param {Function} condition
     * @returns {Array}
     * @example
     *
     * //ex1
     * var hm = new HashMap();
     * hm.set('key', 'value');
     * hm.set('key2', 'value');
     *
     * hm.find(function(value, key) {
     *     return key === 'key2';
     * }); // ['value']
     *
     * //ex2
     * var hm = new HashMap({
     *     'myobj1': {
     *          visible: true
     *      },
     *     'mybobj2': {
     *          visible: false
     *      }
     * });
     *
     * hm.find(function(obj, key) {
     *     return obj.visible === true;
     * }); // [{visible: true}];
     */
    HashMap.prototype.find = function(condition) {
        var founds = [];

        this.each(function(value, key) {
            if (condition(value, key)) {
                founds.push(value);
            }
        });

        return founds;
    };

    /**
     * 내부의 값들을 순서에 상관없이 배열로 반환한다
     * @returns {Array}
     */
    HashMap.prototype.toArray = function() {
        var result = [];

        this.each(function(v, i) {
            result.push(v);
        });

        return result;
    };

    ne.util.HashMap = HashMap;

})(window.ne);

/**********
 * inheritance.js
 **********/

/**
 * @fileoverview 간단한 상속 시뮬레이션
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 전달된 객체를 prototype으로 사용하는 객체를 만들어 반환하는 메서드
     * @param {Object} obj
     * @return {Object}
     */
    function createObject() {
        function F() {}

        return function(obj) {
            F.prototype = obj;
            return new F;
        };
    }

    /**
     * 단순 prototype 확장을 응용한 상속 메서드
     *
     * **주의점**
     *
     * 단순 프로토타입 확장 기능만 제공하므로 자식 생성자의 prototype을 덮어쓰면 안된다.
     *
     * @example
     * function Animal(leg) {
     *     this.leg = leg;
     * }
     *
     * Animal.prototype.growl = function() {
     *     // ...
     * };
     *
     * function Person(name) {
     *     this.name = name;
     * }
     *
     * // 상속
     * core.inherit(Person, Animal);
     *
     * // 이 이후부터는 프로퍼티 편집만으로 확장해야 한다.
     * Person.prototype.walk = function(direction) {
     *     // ...
     * };
     * @param {function} subType 자식 생성자 함수
     * @param {function} superType 부모 생성자 함수
     */
    function inherit(subType, superType) {
        var prototype = ne.util.createObject(superType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    }

    ne.util.createObject = createObject();
    ne.util.inherit = inherit;

})(window.ne);

/**********
 * layer.js
 **********/

/**
 * @fileoverview
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }
})(window.ne);
/**********
 * object.js
 **********/

/**
 * @fileoverview
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 데이터 객체를 확장하는 메서드 (deep copy 는 하지 않는다)
     * @param {object} target - 확장될 객체
     * @param {...object} objects - 프로퍼티를 복사할 객체들
     * @return {object}
     */
    function extend(target, objects) {
        var source,
            prop,
            hasOwnProp = Object.prototype.hasOwnProperty,
            i,
            len;

        for (i = 1, len = arguments.length; i < len; i++) {
            source = arguments[i];
            for (prop in source) {
                if (hasOwnProp.call(source, prop)) {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    }

    /**
     * @type {number}
     */
    var lastId = 0;

    /**
     * 객체에 unique한 ID를 프로퍼티로 할당한다.
     * @param {object} obj - ID를 할당할 객체
     * @return {number}
     */
    function stamp(obj) {
        obj.__fe_id = obj.__fe_id || ++lastId;
        return obj.__fe_id;
    }

    function resetLastId() {
        lastId = 0;
    }

    /**
     * 객체를 전달받아 객체의 키목록을 배열로만들어 리턴해준다.
     * @param obj
     * @returns {Array}
     */
    var keys = function(obj) {
        var keys = [],
            key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        return keys;
    };


    /**
     *
     * 여러개의 json객체들을 대상으로 그것들이 동일한지 비교하여 리턴한다.
     * (출처) http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     *
     * @param {...object} object 비교할 객체 목록
     * @return {boolean} 파라미터로 전달받은 json객체들의 동일 여부
     * @example
     *
       var jsonObj1 = {name:'milk', price: 1000},
           jsonObj2 = {name:'milk', price: 1000},
           jsonObj3 = {name:'milk', price: 1000}

       ne.util.compareJSON(jsonObj1, jsonObj2, jsonObj3);
           => return true

       var jsonObj4 = {name:'milk', price: 1000},
           jsonObj5 = {name:'beer', price: 3000}

       ne.util.compareJSON(jsonObj4, jsonObj5);
          => return false
     */
    function compareJSON(object) {
        var leftChain,
            rightChain,
            argsLen = arguments.length,
            i;

        function isSameObject(x, y) {
            var p;

            // remember that NaN === NaN returns false
            // and isNaN(undefined) returns true
            if (isNaN(x) &&
                isNaN(y) &&
                ne.util.isNumber(x) &&
                ne.util.isNumber(y)) {
                return true;
            }

            // Compare primitives and functions.
            // Check if both arguments link to the same object.
            // Especially useful on step when comparing prototypes
            if (x === y) {
                return true;
            }

            // Works in case when functions are created in constructor.
            // Comparing dates is a common scenario. Another built-ins?
            // We can even handle functions passed across iframes
            if ((ne.util.isFunction(x) && ne.util.isFunction(y)) ||
                (x instanceof Date && y instanceof Date) ||
                (x instanceof RegExp && y instanceof RegExp) ||
                (x instanceof String && y instanceof String) ||
                (x instanceof Number && y instanceof Number)) {
                return x.toString() === y.toString();
            }

            // At last checking prototypes as good a we can
            if (!(x instanceof Object && y instanceof Object)) {
                return false;
            }

            if (x.isPrototypeOf(y) ||
                y.isPrototypeOf(x) ||
                x.constructor !== y.constructor ||
                x.prototype !== y.prototype) {
                return false;
            }

            // check for infinitive linking loops
            if (ne.util.inArray(x, leftChain) > -1 ||
                ne.util.inArray(y, rightChain) > -1) {
                return false;
            }

            // Quick checking of one object beeing a subset of another.
            for (p in y) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }
            }

            //인풋 데이터 x의 오브젝트 키값으로 값을 순회하면서
            //hasOwnProperty, typeof 체크를 해서 비교하고 x[prop]값과 y[prop] 가 같은 객체인지 판별한다.
            for (p in x) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }

                if (typeof(x[p]) === 'object' || typeof(x[p]) === 'function') {
                    leftChain.push(x);
                    rightChain.push(y);

                    if (!isSameObject(x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                } else if (x[p] !== y[p]) {
                    return false;
                }
            }

            return true;
        }

        if (argsLen < 1) {
            return true;
        }

        for (i = 1; i < argsLen; i++) {
            leftChain = [];
            rightChain = [];

            if (!isSameObject(arguments[0], arguments[i])) {
                return false;
            }
        }

        return true;
    }

    ne.util.extend = extend;
    ne.util.stamp = stamp;
    ne.util._resetLastId = resetLastId;
    ne.util.keys = Object.keys || keys;
    ne.util.compareJSON = compareJSON;
})(window.ne);

/**********
 * simulation.js
 **********/

/**
 * @fileoverview
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }
})(window.ne);

/**********
 * string.js
 **********/

/**
 * @fileoverview 문자열 조작 모듈
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 전달된 문자열에 모든 HTML Entity 타입의 문자열을 원래의 문자로 반환
     * @method decodeHTMLEntity
     * @param {String} htmlEntity HTML Entity 타입의 문자열
     * @return {String} 원래 문자로 변환된 문자열
     * @example
     var htmlEntityString = "A &#39;quote&#39; is &lt;b&gt;bold&lt;/b&gt;"
     var result = decodeHTMLEntity(htmlEntityString); //결과값 : "A 'quote' is <b>bold</b>"
     */
    function decodeHTMLEntity(htmlEntity) {
        var entities = {'&quot;' : '"', '&amp;' : '&', '&lt;' : '<', '&gt;' : '>', '&#39;' : '\'', '&nbsp;' : ' '};
        return htmlEntity.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, function(m0) {
            return entities[m0] ? entities[m0] : m0;
        });
    }
    /**
     * 전달된 문자열을 HTML Entity 타입의 문자열로 반환
     * @method encodeHTMLEntity
     * @param {String} html HTML 문자열
     * @return {String} HTML Entity 타입의 문자열로 변환된 문자열
     * @example
     var htmlEntityString = "<script> alert('test');</script><a href='test'>";
     var result = encodeHTMLEntity(htmlEntityString);
     //결과값 : "&lt;script&gt; alert(&#39;test&#39;);&lt;/script&gt;&lt;a href=&#39;test&#39;&gt;"
     */
    function encodeHTMLEntity(html) {
        var entities = {'"': 'quot', '&': 'amp', '<': 'lt', '>': 'gt', '\'': '#39'};
        return html.replace(/[<>&"']/g, function(m0) {
            return entities[m0] ? '&' + entities[m0] + ';' : m0;
        });
    }
    /**
     * html Entity 로 변환할 수 있는 문자가 포함되었는지 확인
     * @param {String} string
     * @return {boolean}
     */
    function hasEncodableString(string) {
        return /[<>&"']/.test(string);
    }

    ne.util.decodeHTMLEntity = decodeHTMLEntity;
    ne.util.encodeHTMLEntity = encodeHTMLEntity;
    ne.util.hasEncodableString = hasEncodableString;
})(window.ne);

/**********
 * type.js
 **********/

/**
 * @fileoverview 타입체크 모듈
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 값이 정의되어 있는지 확인(null과 undefined가 아니면 true를 반환한다)
     * @param {*} obj
     * @param {(String|Array)} [key]
     * @returns {boolean}
     * @example
     *
     * var obj = {a: {b: {c: 1}}};
     * a 가 존재하는지 확인한다(존재함, true반환)
     * ne.util.isExisty(a);
     * => true;
     * a 에 속성 b 가 존재하는지 확인한다.(존재함, true반환)
     * ne.util.isExisty(a, 'b');
     * => true;
     * a 의 속성 b에 c가 존재하는지 확인한다.(존재함, true반환)
     * ne.util.isExisty(a, 'b.c');
     * => true;
     * a 의 속성 b에 d가 존재하는지 확인한다.(존재하지 않음, false반환)
     * ne.util.isExisty(a, 'b.d');
     * => false;
     */
    function isExisty(obj, key) {
        if (arguments.length < 2) {
            return !isNull(obj) && !isUndefined(obj);
        }
        if (!isObject(obj)) {
            return false;
        }

        key = isString(key) ? key.split('.') : key;

        if (!isArray(key)) {
            return false;
        }
        key.unshift(obj);

        var res = ne.util.reduce(key, function(acc, a) {
            if (!acc) {
                return;
            }
            return acc[a];
        });
        return !isNull(res) && !isUndefined(res);
    }

    /**
     * 인자가 undefiend 인지 체크하는 메서드
     * @param obj
     * @returns {boolean}
     */
    function isUndefined(obj) {
        return obj === undefined;
    }

    /**
     * 인자가 null 인지 체크하는 메서드
     * @param {*} obj
     * @returns {boolean}
     */
    function isNull(obj) {
        return obj === null;
    }

    /**
     * 인자가 null, undefined, false가 아닌지 확인하는 메서드
     * (0도 true로 간주한다)
     *
     * @param {*} obj
     * @return {boolean}
     */
    function isTruthy(obj) {
        return isExisty(obj) && obj !== false;
    }

    /**
     * 인자가 null, undefined, false인지 확인하는 메서드
     * (truthy의 반대값)
     * @param {*} obj
     * @return {boolean}
     */
    function isFalsy(obj) {
        return !isTruthy(obj);
    }


    var toString = Object.prototype.toString;

    /**
     * 인자가 arguments 객체인지 확인
     * @param {*} obj
     * @return {boolean}
     */
    function isArguments(obj) {
        var result = isExisty(obj) &&
            ((toString.call(obj) === '[object Arguments]') || 'callee' in obj);

        return result;
    }

    /**
     * 인자가 배열인지 확인
     * @param {*} obj
     * @return {boolean}
     */
    function isArray(obj) {
        return toString.call(obj) === '[object Array]';
    }

    /**
     * 인자가 객체인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isObject(obj) {
        return obj === Object(obj);
    }

    /**
     * 인자가 함수인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isFunction(obj) {
        return toString.call(obj) === '[object Function]';
    }

    /**
     * 인자가 숫자인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isNumber(obj) {
        return toString.call(obj) === '[object Number]';
    }

    /**
     * 인자가 문자열인지 확인하는 메서드
     * @param obj
     * @return {boolean}
     */
    function isString(obj) {
        return toString.call(obj) === '[object String]';
    }

    /**
     * 인자가 불리언 타입인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isBoolean(obj) {
        return toString.call(obj) === '[object Boolean]';
    }

    /**
     * 인자가 HTML Node 인지 검사한다. (Text Node 도 포함)
     * @param {HTMLElement} html
     * @return {Boolean} HTMLElement 인지 여부
     */
    function isHTMLNode(html) {
        if (typeof(HTMLElement) === 'object') {
            return (html && (html instanceof HTMLElement || !!html.nodeType));
        }
        return !!(html && html.nodeType);
    }
    /**
     * 인자가 HTML Tag 인지 검사한다. (Text Node 제외)
     * @param {HTMLElement} html
     * @return {Boolean} HTMLElement 인지 여부
     */
    function isHTMLTag(html) {
        if (typeof(HTMLElement) === 'object') {
            return (html && (html instanceof HTMLElement));
        }
        return !!(html && html.nodeType && html.nodeType === 1);
    }
    /**
     * null, undefined 여부와 순회 가능한 객체의 순회가능 갯수가 0인지 체크한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     */
    function isEmpty(obj) {
        var key,
            hasKey = false;

        if (!isExisty(obj)) {
            return true;
        }

        if (isArray(obj) || isArguments(obj)) {
            return obj.length === 0;
        }

        if (isObject(obj) && !isFunction(obj)) {
            ne.util.forEachOwnProperties(obj, function() {
                hasKey = true;
                return false;
            });

            return !hasKey;
        }

        return true;

    }

    /**
     * isEmpty 메서드와 반대로 동작한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     */
    function isNotEmpty(obj) {
        return !isEmpty(obj);
    }


    ne.util.isExisty = isExisty;
    ne.util.isUndefined = isUndefined;
    ne.util.isNull = isNull;
    ne.util.isTruthy = isTruthy;
    ne.util.isFalsy = isFalsy;
    ne.util.isArguments = isArguments;
    ne.util.isArray = Array.isArray || isArray;
    ne.util.isObject = isObject;
    ne.util.isFunction = isFunction;
    ne.util.isNumber = isNumber;
    ne.util.isString = isString;
    ne.util.isBoolean = isBoolean;
    ne.util.isHTMLNode = isHTMLNode;
    ne.util.isHTMLTag = isHTMLTag;
    ne.util.isEmpty = isEmpty;
    ne.util.isNotEmpty = isNotEmpty;

})(window.ne);

/**********
 * window.js
 **********/

/**
 * @fileoverview 팝업 윈도우 관리 모듈
 * @author FE개발팀
 * @dependency browser.js, type.js, object.js, collection.js, func.js, window.js
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    var popup_id = 0;

    /**
     * 팝업 컨트롤 클래스
     * @constructor
     * @exports Popup
     * @class
     */
    function Popup() {

        /**
         * 팝업창 캐시용 객체 프로퍼티
         * @type {object}
         */
        this.openedPopup = {};

        /**
         * IE7 에서 부모창과 함께 팝업이 닫힐 지 여부를 가리는 closeWithParent프로퍼티를 Window객체에 추가하면
         * 오류가 발생하는 문제가 있어서, 이를 저장하기 위한 별개의 프로퍼티를 만듦.
         * @type {object}
         */
        this.closeWithParentPopup = {};

        /**
         * IE11 팝업 POST 데이터 브릿지
         * @type {string}
         */
        this.postDataBridgeUrl = '';
    }

    /**********
     * public methods
     **********/

    /**
     * 현재 윈도우가 관리하는 팝업 창 리스트를 반환합니다.
     * @method getPopupList
     * @param {String} [key] key에 해당하는 팝업을 반환한다
     * @returns {Object} popup window list object
     */
    Popup.prototype.getPopupList = function(key) {
        var target;
        if (ne.util.isExisty(key)) {
            target = this.openedPopup[key];
        } else {
            target = this.openedPopup;
        }
        return target;
    };

    /**
     * 팝업창을 여는 메서드
     *
     * IE11에서 POST를 사용해 팝업에 값을 전달할 땐 꼭 postDataBridgeUrl을 설정해야 한다
     *
     * 주의: 다른 도메인을 팝업으로 띄울 경우 보안 문제로 팝업 컨트롤 기능을 사용할 수 없다.
     *
     * @param {String} url 팝업 URL
     * @param {object} options
     *     @param {String} [options.popupName]
     *     팝업창의 key를 설정할 수 있습니다.
     *     이 key를 지정하면 같은 key로 팝업을 열려 할 때 이미 열려있는 경우에는 포커스를 주고, 없는 경우 같은 key로 팝업을 엽니다.
     *
     *     @param {String} [options.popupOptionStr=""]
     *     팝업 윈도우의 기능을 설정할 수 있습니다. window.open() 메서드의 세 번째 인자를 그대로 전달하면 됩니다.
     *     이 기능의 적용에는 브라우저마다 차이가 있습니다. http://www.w3schools.com/jsref/met_win_open.asp 를 참고하시기 바랍니다.
     *
     *     @param {Boolean} [options.closeWithParent=true]
     *     팝업 윈도우를 연 윈도우가 닫힐 때 같이 닫힐 지 여부를 설정할 수 있습니다.
     *
     *     @param {Boolean} [options.useReload=false]
     *     이미 열린 팝업 윈도우를 다시 열 때 새로고침 할 것인지를 설정할 수 있습니다. post 데이터를 전송하는 경우 일부 브라우저에서는 다시 전송 여
     *     부를 묻는 메시지가 출력될 수 있습니다.
     *
     *     @param {string} [options.postDataBridgeUrl='']
     *     IE11 에서 POST로 팝업에 데이터를 전송할 때 팝업이 아닌 새 탭으로 열리는 버그를 우회하기 위한 페이지의 url을 입력합니다.
     *     참고: http://wiki.nhnent.com/pages/viewpage.action?pageId=240562844
     *
     *     @param {String} [options.method=get]
     *     팝업 윈도우에 폼 데이터 자동 전송 기능 이용 시, 데이터 전달 방식을 지정할 수 있습니다.
     *
     *     @param {object} [options.param=null]
     *     팝업 윈도우에 폼 데이터 자동 전송 기능 이용 시, 전달할 데이터를 객체로 넘겨주시면 됩니다.
     */
    Popup.prototype.openPopup = function(url, options) {
        options = ne.util.extend({
            popupName: 'popup_' + popup_id + '_' + (+new Date()),
            popupOptionStr: '', // 팝업 옵션
            useReload: true, // 팝업이 열린 상태에서 다시 열려고 할 때 새로고침 하는지 여부
            closeWithParent: true, // 부모창 닫힐때 팝업 닫기 여부
            method: 'get',
            param: {}
        }, options || {});

        options.method = options.method.toUpperCase();

        this.postDataBridgeUrl = options.postDataBridgeUrl || this.postDataBridgeUrl;

        var popup,
            formElement,
            useIEPostBridge = options.method === 'POST' && options.param &&
                ne.util.browser.msie && ne.util.browser.version === 11;

        if (!ne.util.isExisty(url)) {
            throw new Error('Popup#open() 팝업 URL이 입력되지 않았습니다');
        }

        popup_id += 1;

        // 폼 전송 기능 이용 시 팝업 열기 전 폼을 생성하고 팝업이 열림과 동시에 폼을 전송한 후 폼을 제거한다.
        if (options.param) {
            if (options.method === 'GET') {
                url = url + (/\?/.test(url) ? '&' : '?') + this._parameterize(options.param);
            } else if (options.method === 'POST') {
                if (!useIEPostBridge) {
                    formElement = this.createForm(url, options.param, options.method, options.popupName);
                    url = 'about:blank';
                }
            }
        }

        popup = this.openedPopup[options.popupName];

        if (!ne.util.isExisty(popup)) {
            this.openedPopup[options.popupName] = popup = this._open(useIEPostBridge, options.param,
                url, options.popupName, options.popupOptionStr);

        } else {
            if (popup.closed) {
                this.openedPopup[options.popupName] = popup = this._open(useIEPostBridge, options.param,
                    url, options.popupName, options.popupOptionStr);

            } else {
                if (options.useReload) {
                    popup.location.replace(url);
                }
                popup.focus();
            }
        }

        this.closeWithParentPopup[options.popupName] = options.closeWithParent;

        if (!popup || popup.closed || ne.util.isUndefined(popup.closed)) {
            alert('브라우저에 팝업을 막는 기능이 활성화 상태이기 때문에 서비스 이용에 문제가 있을 수 있습니다. 해당 기능을 비활성화 해 주세요');
        }

        if (options.param && options.method === 'POST' && !useIEPostBridge) {
            if (popup) {
                formElement.submit();
            }
            if (formElement.parentNode) {
                formElement.parentNode.removeChild(formElement);
            }
        }

        window.onunload = ne.util.bind(this.closeAllPopup, this);
    };

    /**
     * 팝업 윈도우를 닫습니다.
     * @param {Boolean} [skipBeforeUnload]
     * @param {Window} [popup] 닫을 윈도우 객체. 생략하면 현재 윈도우를 닫습니다
     */
    Popup.prototype.close = function(skipBeforeUnload, popup) {
        skipBeforeUnload = ne.util.isExisty(skipBeforeUnload) ? skipBeforeUnload : false;

        var target = popup || window;

        if (skipBeforeUnload) {
            window.onunload = null;
        }

        if (!target.closed) {
            target.opener = window.location.href;
            target.close();
        }
    };

    /**
     * 이 창에서 열린 모든 팝업을 닫습니다.
     * @param {Boolean} closeWithParent true 면 openPopup 메서드 호출 시 부모창과 함께 닫기로 설정된 팝업들만 닫습니다.
     */
    Popup.prototype.closeAllPopup = function(closeWithParent) {
        var hasArg = ne.util.isExisty(closeWithParent);

        ne.util.forEachOwnProperties(this.openedPopup, function(popup, key) {
            if ((hasArg && this.closeWithParentPopup[key]) || !hasArg) {
                this.close(false, popup);
            }
        }, this);
    };

    /**
     * 해당 팝업 윈도우를 활성화 시킨다.
     * @param {String} popupName 활성화 시킬 팝업 윈도우 이름
     */
    Popup.prototype.focus = function(popupName) {
        this.getPopupList(popupName).focus();
    };

    /**
     * 브라우저의 query string을 파싱해 객체 형태로 반환
     * @return {object}
     * @private
     */
    Popup.prototype.parseQuery = function() {
        var search,
            pair,
            param = {};

        search = window.location.search.substr(1);
        ne.util.forEachArray(search.split('&'), function(part) {
            pair = part.split('=');
            param[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        });

        return param;
    };

    /**
     * 주어진 인자로 숨겨진 폼을 생성하여 문서에 추가하고 반환
     * @param {string} action 폼 전송 URL
     * @param {object} [data] 폼 전송 시 보내질 데이터
     * @param {string} [method]
     * @param {string} [target]
     * @param {HTMLElement} [container]
     * @returns {HTMLElement}
     */
    Popup.prototype.createForm = function(action, data, method, target, container) {
        var form = document.createElement('form'),
            input;

        container = container || document.body;

        form.method = method || 'POST';
        form.action = action || '';
        form.target = target || '';
        form.style.display = 'none';

        ne.util.forEachOwnProperties(data, function(value, key) {
            input = document.createElement('input');
            input.name = key;
            input.type = 'hidden';
            input.value = value;
            form.appendChild(input);
        });

        container.appendChild(form);

        return form;
    };

    /**********
     * private methods
     **********/

    /**
     * 객체를 쿼리스트링 형태로 변환
     * @param {object} object
     * @returns {string}
     * @private
     */
    Popup.prototype._parameterize = function(object) {
        var query = [];

        ne.util.forEachOwnProperties(object, function(value, key) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        });

        return query.join('&');
    };

    /**
     * 실제 팝업을 여는 메서드
     * @param {Boolean} useIEPostBridge IE11에서 팝업에 포스트 데이터를 전달할 때 우회 기능 사용 여부
     * @param {object} param 팝업에 전달할 데이터
     * @param {String} url 팝업 URL
     * @param {String} popupName 팝업 이름
     * @param {String} optionStr 팝업 기능 설정용 value ex) 'width=640,height=320,scrollbars=yes'
     * @returns {Window}
     * @private
     */
    Popup.prototype._open = function(useIEPostBridge, param, url, popupName, optionStr) {
        var popup;

        if (useIEPostBridge) {
            url = this.postDataBridgeUrl + '?storageKey=' + encodeURIComponent(popupName) +
            '&redirectUrl=' + encodeURIComponent(url);
            if (!window.localStorage) {
                alert('IE11브라우저의 문제로 인해 이 기능은 브라우저의 LocalStorage 기능을 활성화 하셔야 이용하실 수 있습니다');
            } else {
                localStorage.removeItem(popupName);
                localStorage.setItem(popupName, JSON.stringify(param));

                popup = window.open(url, popupName, optionStr);
            }
        } else {
            popup = window.open(url, popupName, optionStr);
        }

        return popup;
    };

    ne.util.popup = new Popup();

})(window.ne);

ne = window.ne || {};
ne.component = ne.component || {};

/**
 * @fileoverview 기본 클래스 파일
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * unique key 를 생성할 때 사용하는 key 값
 * @type {number}
 */
var uniqueKey = 0;

/**
 * Base Class
 * @constructor Base
 */
var Base = ne.util.defineClass(/**@lends Base.prototype */{
    init: function(options) {
        if (options && options.grid) {
            this.setOwnProperties({
                grid: options.grid
            });
        }
    },

   /**
    * 유일한 key 값을 생성한다.
    * @return {number}
    * @private
    */
    getUniqueKey: function() {
        return ++uniqueKey;
    },

    /**
     * 내부 프로퍼티를 설정한다.
     * @param {object} properties
     * @return {Base}
     * @private
     */
    setOwnProperties: function(properties) {
        ne.util.forEach(properties, function(value, name) {
            this[name] = value;
        }, this);
        return this;
    },

    /**
     * error 객체를 리턴한다.
     * @param {string} msg
     * @return {error} 에러 객체
     */
    error: function(msg) {
        var error = function() {
            this.message = msg;
        };
        error.prototype = new Error();
        return new error();
    }
});

// 커스텀이벤트 믹스인
ne.util.CustomEvents.mixin(Base);

/**
 * View base class
 * @constructor Base.View
 */
Base.View = ne.util.defineClass(Base, /**@lends Base.View.prototype */{
    tagName: 'div',
    className: '',
    eventHandler: {},
    style: '',

    /**
     * 생성자
     * @param attributes
     */
    init: function(attributes) {
        Base.prototype.init.apply(this, arguments);

        var eventHandler = {},
            $el = attributes && attributes.$el || $('<' + this.tagName + '>');

        $el.addClass(this.className);

        ne.util.forEach(this.eventHandler, function(methodName, eventName) {
            eventHandler[eventName] = $.proxy(this[methodName], this);
        }, this);

        this._attachHandler($el);

        if (attributes && attributes.model) {
            this.setOwnProperties({
                model: attributes.model
            });
        }
        this.setOwnProperties({
            _viewList: [],
            _eventHandler: eventHandler,
            $el: $el,
            el: $el[0]
        });
        this._initializeStyle();
    },

    /**
     * style 이 설정되어있다면 default style 을 적용한다.
     * @private
     */
    _initializeStyle: function() {
        if (this.style) {
            this.$el.attr('style', this.style);
        }
    },

    /**
     * 이벤트 핸들러를 attach 또는 detach 한다.
     * @param {jQuery} [$target     ] 이벤트 핸들러의 대상 $target
     * @param {boolean} isAttach    attach 할 지 여부
     * @private
     */
    _dispatchHandler: function($target, isAttach) {
        $target = $target || this.$el;
        if ($target.length) {
            ne.util.forEach(this._eventHandler, function(handler, name) {
                var tmp = name.split(' '),
                    eventName = tmp[0],
                    selector = tmp[1] || '';

                if (selector) {
                    $target = $target.find(selector);
                }

                $target.off(eventName);

                if (isAttach) {
                    $target.on(eventName, handler);
                }
            }, this);
        }
    },

    /**
     * event 를 attach 한다.
     * @param {jQuery} [$target]
     * @private
     */
    _attachHandler: function($target) {
        /* istanbul ignore next: dispatchHandler 에서 테스트 함 */
        this._dispatchHandler($target, true);
    },

    /**
     * event 를 detach 한다.
     * @param {jQuery} [$target]
     * @private
     */
    _detachHandler: function($target) {
        /* istanbul ignore next: dispatchHandler 에서 테스트 함 */
        this._dispatchHandler($target);
    },

     /**
     * create view
     * @param {function} constructor
     * @param {object} params
     * @return {object} instance
     */
    createView: function(constructor, params) {
        var instance = new constructor(params);
        if (!this.hasOwnProperty('_viewList')) {
            this.setOwnProperties({
                _viewList: []
            });
        }
        this._viewList.push(instance);
        return instance;
    },

    /**
     * destroyChildren
     */
    destroyChildren: function() {
        if (ne.util.isArray(this._viewList)) {
            while (this._viewList.length !== 0) {
                this._viewList.pop().destroy();
            }
        }
    },

    /**
     * destroy
     */
    destroy: function() {
        this.destroyChildren();
        this._detachHandler(this.$el);
        this.$el.empty().remove();
    }
});
/**
 * Utility 메서드 모음
 * @type {{template: Function}}
 */
var Util = {
    /**
     * template 문자열을 치환하는 메서드
     * @param {String} template String
     * @param {Object} mapper
     * @return {String}
     * @example
     var template = '<div width="<%=width%>" height="<%=height%>">';
     Util.template(template, {
        width: 100,
        height: 200
     });

     ->
     '<div width="100" height="200">';
     */
    template: function(template, mapper) {
        template.replace(/<%=[^%]+%>/g, '');
        var replaced = template.replace(/<%=([^%]+)%>/g, function(matchedString, name, index, fullString) {
            return ne.util.isUndefined(mapper[name]) ? '' : mapper[name].toString();
        });
        return replaced;
    },

    /**
     * 행 개수와 한 행당 높이를 인자로 받아 테이블 body 의 전체 높이를 구한다.
     * @param {number} rowCount     행의 개수
     * @param {number} rowHeight    한 행의 높이
     * @param {number} border   테두리 값
     * @return {number}
     */
    getHeight: function(rowCount, rowHeight, border) {
        border = ne.util.isUndefined(border) ? 1 : border;
        return rowCount === 0 ? rowCount : rowCount * (rowHeight + border) + border;
    },

    /**
     *Table 의 높이와 행당 높이를 인자로 받아, table 에서 보여줄 수 있는 행 개수를 반환한다.
     *
     * @param {number} height   테이블 높이
     * @param {number} rowHeight    행의 높이
     * @return {number}
     */
    getDisplayRowCount: function(height, rowHeight) {
        return Math.ceil((height - 1) / (rowHeight + 1));
    },

    /**
     * Table 의 height 와 행 개수를 인자로 받아, 한 행당 높이를 구한다.
     *
     * @param {number} rowCount 행 개수
     * @param {number} height   테이블 높이
     * @return {number}
     */
    getRowHeight: function(rowCount, height) {
        return rowCount === 0 ? 0 : Math.floor(((height - 1) / rowCount)) - 1;
    },

    /**
     * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
     * @param {string} htmlString   html 마크업 문자열
     * @return {String} HTML tag 에 해당하는 부분을 제거한 문자열
     */
    stripTags: function(htmlString) {
        var matchResult;
        htmlString = htmlString.replace(/[\n\r\t]/g, '');
        if (ne.util.hasEncodableString(htmlString)) {
            if (/<img/i.test(htmlString)) {
                matchResult = htmlString.match(/<img[^>]*\ssrc=[\"']?([^>\"']+)[\"']?[^>]*>/i);
                htmlString = matchResult ? matchResult[1] : '';
            } else {
                htmlString = htmlString.replace(/<button.*?<\/button>/gi, '');
            }
            htmlString = $.trim(ne.util.decodeHTMLEntity(htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig, '')));
        }
        return htmlString;
    }
};

/**
 * @fileoverview 원본데이터 콜렉션 클래스
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
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
     * @param {Array} list  콜랙션 list
     */
    set: function(list) {
        this.worker.enqueue(this._set, arguments, this);
    },

    /**
     * set enqueue 할 내부 함수
     * @param {Array} list  콜랙션 list
     * @private
     */
    _set: function(list) {
        this.list = this._getFormattedList(list);
        if (this.maxLength > 0 && this.list.length > this.maxLength) {
            this._removeMap(0, this.list.length - this.maxLength);
            this.list = this.list.slice(this.list.length - this.maxLength, this.list.length);
        }
        this.invoke('change', {
            'type': 'set',
            'list': list
        });
    },

    /**
     * 사용하지 않는 Map 을 제거한다.
     * @param {number} start    제거 시작 index
     * @param {number} end      제거 끝 index
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
     * @return {Array}  사용할 수 있는 포멧의 데이터 리스트
     * @private
     */
    _getFormattedList: function(list) {
        var obj,
            id,
            idAttribute = this.grid.option('idAttribute'),
            formattedList = [],
            hasIdAttribute = !!idAttribute;

        ne.util.forEachArray(list, function(data) {
            id = hasIdAttribute ? data[idAttribute] : this.idx++;
            obj = {
                //id: this._getId(data),
                id: id,
                data: data
            };
            formattedList.push(obj);
            this.map[obj.id] = obj;
        }, this);
        return formattedList;
    },

    /**
     * 배열에서 index 에 해당하는 데이터를 반환한다.
     * @param {number} index 인덱스
     * @return {*}  index 에 해당하는 데이터
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
                if (data && data.id.toString() === obj.id.toString()) {
                    index = i;
                    return false;
                }
            }, this);
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
     * key 에 해당하는 data 를 제거한다.
     * @param {String|Array} id 삭제할 데이터의 key. 복수개일때 array 를 인자로 넘긴다.
     */
    remove: function(id) {
        this.worker.enqueue(this._remove, arguments, this);
    },

    /**
     * 실제 데이터를 삭제한다.
     * @param {String|Array} id id 삭제할 데이터의 key. 복수개일때 array 를 인자로 넘긴다.
     * @private
     */
    _remove: function(id) {
        var idList = ne.util.isArray(id) ? id : [id];

        ne.util.forEachArray(idList, function(id) {
            var index = this.indexOf(this.get(id));
            this.map[id] = undefined;
            delete this.map[id];
            this.list.splice(index, 1);
        }, this);

        this.invoke('change', {
            type: 'remove',
            list: this.list
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


/**
 * @fileoverview 큐를 이용한 Job Worker
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Collection job Worker
 * @constructor Worker
 */
var Worker = ne.util.defineClass(Base, /**@lends Worker.prototype */{
    init: function() {
        Base.prototype.init.apply(this, arguments);
        this.setOwnProperties({
            locked: false,
            queue: []
        });
    },

    /**
     * worker 에 lock 을 건다.
     * 이 때 job 들은 queue 에 적재되어 unlock 시 한번에 수행된다.
     */
    lock: function() {
        this.locked = true;
    },

    /**
     * lock을 해제하며 queue 에 적재된 job을 수행한다.
     * @param {boolean} skipRunQueue  runQueue 를 수행할지 여부
     */
    unlock: function(skipRunQueue) {
        if (!skipRunQueue) {
            this.runQueue();
        }
        this.locked = false;
    },

    /**
     * queue 에 job을 적재한다.
     * @param {Function} job   수행할 작업
     * @param {Array} args      arguments
     * @param {context} context 컨텍스트
     */
    enqueue: function(job, args, context) {
        if (this.locked) {
            this.queue.push({
                job: job,
                args: args,
                context: context
            });
        } else {
            job.apply(context, args);
        }
    },

    /**
     * dequeue 한다.
     * @return {{job: Function, args: Array, context: context}}
     */
    dequeue: function() {
        return this.queue.shift();
    },

    /**
     * 적재된 queue 의 job 들을 전부 수행 한다.
     */
    runQueue: function() {
        var item = this.dequeue();
        while (item) {
            item.job.apply(item.context, item.args);
            item = this.dequeue();
        }
    }
});

/**
 * @fileoverview 원본 Data를 한번 가공하여 View 에서 사용할 수 있는 데이터 구조를 담고 있는 클래스 모음
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
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

/**
 * @fileoverview 원본 Data를 한번 가공하여 View 에서 사용할 수 있는 데이터 구조를 담고 있는 클래스 모음
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * View 에서 참조하여 rendering 하도록, 원본 데이터를 가공한 render model
 * @constructor Model
 */
var Model = ne.util.defineClass(Base, /**@lends Model.prototype */{
    /**
     * 생성자
     * @param attributes
     */
    init: function(attributes) {
        Base.prototype.init.apply(this, arguments);
        this._initializeVariables();
        this._setHeight();
        this.collection.on({
            'change': this._onCollectionChange
        }, this);
        this.on({
            'change': this._onChange
        }, this);
        this._calculateColumnWidthList();
    },

    /**
     * 인스턴스 생성시 변수를 초기화한다.
     * @private
     */
    _initializeVariables: function() {
        this.setOwnProperties({
            collection: new Collection({grid: this.grid}),          //원본 데이터 collection
            offsetTop: 0,
            offsetLeft: 0,
            width: 0,
            height: 0,
            minimumColumnWidth: this.grid.option('minimumColumnWidth'),
            headerHeight: this.grid.option('headerHeight'),
            containerHeight: 0,
            containerWidth: 0,
            stopChangeEvent: false,
            freeze: false,
            rowHeight: this.grid.option('rowHeight') || 0,
            scrollTop: 0,
            scrollLeft: 0,
            maxScrollTop: 0,
            startIdx: 0,
            endIdx: 0,
            top: 0,
            list: [],
            hiddenLineCount: 10,   //스마트 랜더링시 한번에 랜더링할 숨겨진 행의 개수 (상단, 하단 각각의 행 개수)
            criticalPoint: 3       //스크롤 시 숨겨진 행의 개수가 criticalPoint 만큼 남았다면 다음 페이지 랜더링을 시도 한다.
        });
    },

    /**
     * clear 시 변수를 리셋 한다.
     * @private
     */
    _resetVariables: function() {
        this.set({
            stopChangeEvent: false,
            freeze: false,
            headerHeight: this.grid.option('headerHeight'),
            rowHeight: this.grid.option('rowHeight') || 0,
            scrollTop: 0,
            scrollLeft: 0,
            maxScrollTop: 0,
            startIdx: 0,
            endIdx: 0,
            top: 0,
            list: []
        });
    },

    /**
     * 원본 데이터 collection 이 변경 되었을 경우 이벤트 핸들러
     * @param {Object} changeEvent Collection 에서 발생한 Change 이벤트
     * @private
     */
    _onCollectionChange: function(changeEvent) {
        var type = changeEvent.type;
        this.stopChangeEvent = true;

        switch (type) {
            case 'clear':
                this._resetVariables();
                this._refresh();
                break;
            case 'prepend':
                this._doFreeze(changeEvent.prepended);
                this._refresh();
                break;
            case 'set':
                this._refresh();
                break;
            case 'append':
                this._refresh();
                break;
            case 'remove':
                this._refresh();
                break;
            default :
                break;
        }
        this.stopChangeEvent = false;
        this._fireChangeEvents({
            top: this.top,
            list: this.list,
            scrollTop: this.scrollTop
        });
    },

    /**
     * 한번에 여러 change event 를 발생한다.
     * @param {object} dataSets 이벤트 데이터 Key-Value 데이터 쌍
     * @private
     */
    _fireChangeEvents: function(dataSets) {
        ne.util.forEach(dataSets, function(value, key) {
            this.invoke('change', {
                key: key,
                value: value
            });
        }, this);
    },

    /**
     * 자기 스스로에 대한 onChange 이벤트 핸들러
     * @param {{key: key, value: value}} changeEvent 자기 자신이 발생하는 Change 이벤트 핸들러
     * @private
     */
    _onChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;

        switch (key) {
            case 'scrollTop':
                this._onScrollTopChange(value);
                break;
            case 'scrollLeft':
                this._onScrollLeftChange(value);
                break;
            case 'rowHeight':
                this.collection.maxLength = this._getMaxCollectionLength();
                break;
            case 'containerHeight':
                this.collection.maxLength = this._getMaxCollectionLength();
                break;
            case 'containerWidth':
                this._calculateColumnWidthList();
                break;
        }
    },

    /**
     * scrollLeft 값이 변경되었을 때 scrollLeft 값 관련 처리
     * @param {number} value 변경된 scrollLeft 값
     * @private
     */
    _onScrollLeftChange: function(value) {
        if (value < 0) {
            this.set('scrollLeft', 0);
        }
    },

    /**
     * scrollTop 이 변경되었을 때 rendering 관련 처리
     * @param {number} value 변경된 scrollTop 값
     * @private
     */
    _onScrollTopChange: function(value) {
        if (this.maxScrollTop < value) {
            this.set('scrollTop', this.maxScrollTop, {silent: true});
        } else if (value < 0) {
            this.set('scrollTop', 0, {silent: true});
        } else {
            if (this._isRenderable()) {
                this._refresh();
            }
        }
    },

    /**
     * IE 에서 div height max 제한으로 인해 maxCollection length 를 반환한다.
     * @private
     */
    _getMaxCollectionLength: function() {
        var border = +this.grid.option('border') || 0;

        if (ne.util.browser.msie) {
            //1533917 is the max height of IE (66692*23 + 1)
            return Math.floor(this.grid.ieMaxHeight / (this.rowHeight + border));
        } else {
            return 0;
        }
    },

    /**
     * maxScrollTop 값을 계산하여 반환한다.
     * @return {number} maxScrollTop 값
     */
    getMaxScrollTop: function() {
        var border = this.grid.option('border'),
            maxScrollTop = Util.getHeight(this.collection.length, this.rowHeight, border) - this.containerHeight;

        if (this.grid.option('scrollX')) {
            maxScrollTop += this.grid.scrollBarSize;
        }

        return Math.max(maxScrollTop, 0);
    },

    /**
     * 값을 설정한다.
     * @param {*} key   키값. Object 형태로 들어올 경우, {key1: value1, key2: value2} 와 같이 다수의 키값을 설정할 수 있다.
     * @param {*} [value] 키에 할당할 값. 첫번째 파라미터에 Object 타입으로 인자를 넘겨주었을 경우 무시된다.
     * @param {{silent: boolean}} [options] silent 값이 true 일 경우 이벤트를 발생하지 않는다.
     */
    set: function(key, value, options) {
        if (ne.util.isObject(key)) {
            ne.util.forEach(key, function(val, key) {
                this.set(key, val, value);
            }, this);
        } else {
            if (this[key] != value) {
                this[key] = value;

                if (!(options && options.silent) && !this.stopChangeEvent) {
                    this.invoke('change', {
                        key: key,
                        value: value
                    });
                }
            }
        }
    },

    /**
     * 높이를 계산하여 설정한다.
     * @private
     */
    _setHeight: function() {
        var height;

        if (ne.util.isExisty(this.grid.option('height'))) {
            height = this.grid.option('height');
            if (this.grid.option('scrollX')) {
                height -= this.grid.scrollBarSize;
            }
        } else {
            height = Util.getHeight(this.grid.option('displayCount'), this.grid.option('rowHeight'), this.grid.option('border'));
        }

        this.set('height', height);
    },

    /**
     * rendering 시 필요한 데이터를 갱신한다.
     * @private
     */
    _refresh: function() {
        var renderData = this._getRenderingData(),
            list = this.collection.list.slice(renderData.startIdx, renderData.endIdx);

        this.set({
            startIdx: renderData.startIdx,
            endIdx: renderData.endIdx,
            list: list,
            top: renderData.top
        });

        this.invoke('refresh');
    },

    /**
     * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
     * @param {Number} index    너비를 변경할 컬럼의 인덱스
     * @param {Number} width    변경할 너비 pixel값
     */
    setColumnWidth: function(index, width) {
        width = Math.max(width, this.minimumColumnWidth);

        var curColumnWidthList = ne.util.extend([], this.columnWidthList);

        if (!ne.util.isUndefined(curColumnWidthList[index])) {
            curColumnWidthList[index] = width;
            this._calculateColumnWidthList(curColumnWidthList);
        }
    },

    /**
     * columnWidthList 를 계산하여 저장한다.
     * @private
     */
    _calculateColumnWidthList: function(columnWidthList) {
        columnWidthList = columnWidthList || [];
        var columnModelList = this.grid.option('columnModelList'),
            defaultColumnWidth = this.grid.option('defaultColumnWidth'),
            minimumColumnWidth = this.grid.option('minimumColumnWidth'),
            border = this.grid.option('border'),
            frameWidth = this.containerWidth - this.grid.scrollBarSize,
            currentWidth = 0,
            unassignedCount = 0,
            unassignedWidth,
            remainWidth,
            diff;

        if (!columnWidthList.length) {
            ne.util.forEachArray(columnModelList, function(columnModel) {
                var width = ne.util.isUndefined(columnModel['width']) ? -1 : Math.max(minimumColumnWidth, columnModel['width']);
                //% 경우 처리
                if (ne.util.isString(width) && width.indexOf('%')) {
                    width = width.replace('%', '');
                    width = Math.floor(frameWidth * (width / 100));
                }

                columnWidthList.push(width);
            }, this);
        }

        ne.util.forEachArray(columnWidthList, function(width) {
            if (width > 0) {
                width = Math.max(minimumColumnWidth, width);
                currentWidth += width + border;
            } else {
                unassignedCount++;
            }
        }, this);
        currentWidth += border;

        remainWidth = frameWidth - currentWidth;
        unassignedWidth = Math.max(minimumColumnWidth, Math.floor(remainWidth / unassignedCount) - border);

        //할당되지 않은 column 할당함
        ne.util.forEachArray(columnWidthList, function(width, index) {
            if (width === -1) {
                columnWidthList[index] = unassignedWidth;
                currentWidth += unassignedWidth + border;
            }
        });

        remainWidth = frameWidth - currentWidth;

        if (remainWidth < 0) {
            frameWidth += Math.abs(remainWidth);
        }
        this.set({
            width: frameWidth,
            columnWidthList: columnWidthList
        });
    },

    /**
     * 인자로 넘어온 list 데이터가 화면에 출력되었을 때 높이를 계산한다.
     * @param {Array} list  인자로 넘어온 list 데이터
     * @return {number} 계산된 높이값
     * @private
     */
    _getDataHeight: function(list) {
        var border = this.grid.option('border');
        return Util.getHeight(list.length, this.rowHeight, border);
    },

    /**
     * 옵션값에 scroll fix 가 설정되어 있다면, scroll fix 한다.
     * @param {Array} list  scrollFix 를 위한 높이 계산 시 사용될 prepend 된 data의 list
     * @private
     */
    _doFreeze: function(list) {
        if (this.freeze || (this.grid.option('freeze') && this.scrollTop !== 0)) {
            var dataHeight = this._getDataHeight(list);
            this.set('maxScrollTop', this.getMaxScrollTop());
            this.set('scrollTop', this.scrollTop + dataHeight);
        }
    },

    /**
     * 렌더링 데이터를 반환한다.
     * @return {{top: number, startIdx: *, endIdx: *}}
     * @private
     */
    _getRenderingData: function() {
        var top,
            border = this.grid.option('border'),
            scrollTop = this.scrollTop,
            rowHeight = this.rowHeight,
            displayCount = this.grid.option('displayCount'),
            startIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + border)) - this.hiddenLineCount),
            endIdx = Math.min(this.collection.length,
                Math.floor(startIdx + this.hiddenLineCount + displayCount + this.hiddenLineCount));

        top = (startIdx === 0) ? 0 : Util.getHeight(startIdx, rowHeight, border) - border;

        return {
            top: top,
            startIdx: startIdx,
            endIdx: endIdx
        };
    },

    /**
     * grid 되었을 시 숨겨진 행의 개수가 critical point 보다 적게 남아있는지를 확인하여 rendering 할지 여부를 결정한다.
     * @return {boolean}    랜더링 여부
     * @private
     */
    _isRenderable: function() {
         var border = this.grid.option('border'),
             scrollTop = this.scrollTop,
             rowHeight = this.rowHeight,
             height = this.height,
             displayCount = this.grid.option('displayCount'),
             rowCount = this.collection.length,
             displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + border))),
             displayEndIdx = Math.min(rowCount - 1, Math.floor((scrollTop + height) / (rowHeight + border))),
             startIdx = Math.max(0, this.startIdx),
             endIdx = Math.min(rowCount, this.endIdx);

        //시작 지점이 임계점 이하로 올라갈 경우 return true
        if (startIdx !== 0) {
            if (startIdx + this.criticalPoint > displayStartIdx) {
                return true;
            }
        }

        //마지막 지점이 임계점 이하로 내려갔을 경우 return true
       if (endIdx !== rowCount) {
            if (endIdx - this.criticalPoint < displayEndIdx) {
                return true;
            }
        }
        return false;
    }
});

/**
 * @fileoverview Body View
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Body View
 * @constructor Body
 */
var Body = ne.util.defineClass(Base.View, /**@lends Body.prototype */{
    eventHandler: {
        'mousedown': '_onMouseDown',
        'click': '_onClick'
    },
    padding: 10,
    className: 'infinite_body',
    style: 'position: absolute; top: 0; white-space: nowrap;',
    _template: {
        table: '<table width="100%" border="0" cellpadding="0" ' +
            'cellspacing="' +
            '<%=border%>' +
            '" ' +
            'bgcolor="' +
            '<%=color%>' +
            '" ' +
            'class="' +
            '<%=className%>' +
            '" ' +
            'style="' +
            'table-layout:fixed' +
            '"' +
            '>' +
            '<colgroup>' +
            '<%=col%>' +
            '</colgroup>' +
            '<tbody>' +
            '<%=tbody%>' +
            '</tbody>',
        tr: '<tr ' +
            'key="' +
            '<%=key%>' +
            '" ' +
            'style="' +
            'height:<%=height%>px;' +
            'background:<%=color%>;' +
            '" ' +
            'class="' +
            '<%=className%>' +
            '" ' +
            '>' +
            '<%=content%>' +
            '</tr>',
        td: '<td ' +
            'columnname="<%=columnName%>" ' +
            'style="' +
            'text-align:<%=align%>;' +
            'overflow:hidden;padding:0 <%=padding%>px;*padding:0 ' +
            '<%=padding%>px;border:0;white-space:nowrap;*white-space:pre;' +
            '" ' +
            'class="' +
            '<%=className%>' +
            '" ' +
            '<%=attributes%>' +
            '>' +
            '<%=content%>' +
            '</td>'
    },

    /**
     * 생성자 함수
     * @param {object} attributes
     * @param   {object} attributes.selection 셀렉션 view 인스턴스
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);

        if (this.grid.option('useSelection')) {
            this.setOwnProperties({
                selection: attributes.selection
            });
        }

        this.setOwnProperties({
            resizeHandler: null,
            isIe7: !!(ne.util.browser.msie && ne.util.browser.version === 7)
        });

        this.grid.focusModel.on('select', this.select, this);
        this.grid.focusModel.on('unselect', this.unselect, this);

        this.model.on({
            'change': this._onModelChange,
            'refresh': this._onRefresh
        }, this);

        this.grid.view.container.on({
            'scroll': this._onScroll
        }, this);
    },

    /**
     * 디자인 클래스를 unselect 한다.
     * @param {(Number|String)} key select 된 해당 row 의 key
     * @param {Object} [selectMap] focusModel 에서 이벤트 발생시 전달되는 selectMap 오브젝트
     */
    select: function(key, selectMap) {
        var $tr = this.$el.find('tr[key="' + key + '"]');

        $tr.length && $tr.css('background', '').addClass('selected');
    },

    /**
     * 디자인 클래스 unselect 한다.
     * @param {(Number|String)} key unselect 된 해당 row 의 key
     * @param {Object} [selectMap] focusModel 에서 이벤트 발생시 전달되는 selectMap 오브젝트
     */
    unselect: function(key, selectMap) {
        var $tr = this.$el.find('tr[key="' + key + '"]'),
            color = this.grid.option('color');
        $tr.length && $tr.removeClass('selected').css('background', color['td']);
    },

    /**
     * 스크롤 이벤트 핸들러
     * @private
     */
    _onScroll: function() {
        if (this.selection) {
            this.selection.draw();
        }
    },

    /**
     * click 이벤트 핸들러
     * @param {event} clickEvent 클릭이벤트
     * @private
     */
    _onClick: function(clickEvent) {
        var $target = $(clickEvent.target),
            columnName = $target.closest('td').attr('columnname'),
            rowKey = $target.closest('tr').attr('key'),
            customEvent = {
                $target: $target,
                rowKey: rowKey,
                columnName: columnName
            };

        this.fire('click', customEvent);
    },

    /**
     * mouseDown 이벤트 핸들러
     * @param {event} mouseDownEvent 마우스다운 이벤트
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        var $target = $(mouseDownEvent.target),
            rowKey = $target.closest('tr').attr('key'),
            selection = this.selection;

        this.grid.focusModel.select(rowKey);
        if (selection) {
            selection.attachMouseEvent(mouseDownEvent);
            if (mouseDownEvent.shiftKey) {
                if (!selection.hasSelection()) {
                    selection.startSelection();
                }
                selection.updateSelection();
            } else {
                selection.stopSelection();
            }
        }
    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     *
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'top') {
            this.$el.css('top', value + 'px');
        } else if (key === 'width') {
            this._setContainerWidth(value);
        } else if (key === 'columnWidthList') {
            this._changeColumnWidth(value);
        }
    },

    /**
     * Model Change 이벤트 핸들러로부터 columnWidthList 를 전달받아, 현재 table의
     * 각 열의 높이를 조정한다.
     * @param {Array} columnWidthList 컬럼 너비 리스트
     * @private
     */
    _changeColumnWidth: function(columnWidthList) {
        var $colList = this.$el.find('colgroup').find('col');

        ne.util.forEachArray(columnWidthList, function(width, index) {
            if (this.isIe7) {
                width -= this.padding * 2;
            }
            $colList.eq(index).css('width', width + 'px');
        }, this);
    },

    /**
     * model 의 refresh 이벤트가 발생했을 때 이벤트 핸들러
     * @private
     */
    _onRefresh: function() {
        this.render();
    },

    /**
     * <colgroup> 내 들어갈 마크업 문자열을 생성한다.
     * @param {Array} columnWidthList   컬럼 너비 정보 리스트
     * @return {string} 마크업 문자열
     * @private
     */
    _getColGroupMarkup: function(columnWidthList) {
        var col = '';

        ne.util.forEachArray(columnWidthList, function(width) {
            if (this.isIe7) {
                width -= this.padding * 2;
            }
            col += '<col style="width:' + width + 'px"></col>';
        }, this);
        return col;
    },

    /**
     * <tbody> 내 들어갈 마크업 문자열을 생성한다.
     * @return {string} 생성된 마크업 문자열
     * @private
     */
    _getTbodyMarkup: function() {
        var list = this.model.list,
            columnModelList = this.grid.option('columnModelList'),
            color = this.grid.option('color'),
            trList = [],
            className = this.grid.option('className');

        //각 tr의 마크업을 생성한다.
        ne.util.forEachArray(list, function(item) {
            var tdList = [],
                height = this.model.rowHeight,
                colSpanBy = item.data['_colSpanBy'],
                length = columnModelList.length,
                attributes = ne.util.isExisty(colSpanBy) ? 'colspan="' + length + '"' : '';
            //각 TD의 마크업을 생성한다.
            ne.util.forEachArray(columnModelList, function(columnModel) {
                var td,
                    columnName = columnModel['columnName'],
                    content;
                //Colspan 이 있으면 해당하는 TD의 마크업만 생성하고, 없다면 전체 TD 마크업을 생성한다.
                if (!ne.util.isExisty(colSpanBy) || colSpanBy === columnName) {
                    if (ne.util.isFunction(columnModel.formatter)) {
                        content = columnModel.formatter(item.data[columnName], item.data);
                    } else {
                        content = item.data[columnName];
                    }
                    td = Util.template(this._template.td, {
                        className: className.td,
                        columnName: columnName,
                        align: columnModel['align'],
                        padding: this.padding,
                        content: content,
                        attributes: attributes
                    });
                    tdList.push(td);
                }
            }, this);

            trList.push(Util.template(this._template.tr, {
                className: className.tr,
                color: color['td'],
                height: height,
                key: item.id,
                content: tdList.join('')
            }));
        }, this);
        return trList.join('');
    },

    /**
     * 랜더링 한다.
     * @return {Body}
     */
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        var columnWidthList = this.model.columnWidthList,
            color = this.grid.option('color'),
            border = this.grid.option('border'),
            selectList = this.grid.focusModel.getSelectList(),
            className = this.grid.option('className');

        this.$el.empty().prepend(Util.template(this._template.table, {
            className: className.table,
            border: border,
            color: border ? color['border'] : '',
            col: this._getColGroupMarkup(columnWidthList),
            tbody: this._getTbodyMarkup()
        }));

        this._setContainerWidth(Math.ceil(this.model.width));
        ne.util.forEachArray(selectList, function(key) {
            this.select(key);
        }, this);

        if (this.selection) {
            this.selection.draw();
        }

        //resize 를 사용한다면 resize handler 를 추가한다.
        if (this.grid.option('useColumnResize')) {
            this.resizeHandler = this.createView(ResizeHandlerContainer, {
                grid: this.grid,
                model: this.model,
                height: this.$el.height()
            });
            this.$el.append(this.resizeHandler.render().el);
        }

        this._attachHandler();

        return this;
    },

    /**
     * Container 의 width 를 설정한다.
     * @param {Number} width 너비값
     * @private
     */
    _setContainerWidth: function(width) {
        if (width === 0) {
            width = '100%';
        } else {
            width = width + 'px';
        }
        this.$el.css('width', width);
    }
});

/**
 * @fileoverview Container 뷰
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Container View
 * @constructor Container
 */
var Container = ne.util.defineClass(Base.View, /**@lends Container.prototype */{
    className: 'infinite_container',
    eventHandler: {
        'scroll': '_onScroll'
    },
    style: 'position: relative;',
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);

        this.model.on({
            'change': this._onModelChange
        }, this);
        this._initializeCss();
    },

    /**
     * option 값에 맞춰 css 스타일을 지정한다.
     * @private
     */
    _initializeCss: function() {
        var color = this.grid.option('color')['border'],
            border = this.grid.option('border');

        this.$el.css({
            'overflow-x': this.grid.option('scrollX') ? 'scroll' : 'hidden',
            'overflow-y': this.grid.option('scrollY') ? 'scroll' : 'hidden',
            'height': this.grid.option('scrollX') ? this.model.height + this.grid.scrollBarSize : this.model.height
        });
        if (border === 0) {
            this.$el.css('border', 'solid 1px ' + color);
        }

    },

    /**
     * scroll event handler
     *  - scroll top 과 scroll left 를 동기화 한다.
     * @param {event} scrollEvent 스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        var difference = Math.abs(this.model.scrollTop - scrollEvent.target.scrollTop);
        //FF 에서의 스크롤 문제 해결
        if (difference < 10 && difference > 0) {
            if (this.model.scrollTop > scrollEvent.target.scrollTop) {
                scrollEvent.target.scrollTop -= 80;
            } else {
                scrollEvent.target.scrollTop += 80;
            }
        }
        this.model.set({
            'scrollTop': scrollEvent.target.scrollTop,
            'scrollLeft': scrollEvent.target.scrollLeft
        });
        this.invoke('scroll', scrollEvent);

    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     *
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'scrollTop') {
            this.el.scrollTop = value;
        } else if (key === 'scrollLeft') {
            this.el.scrollLeft = value;
            if (this.el.scrollLeft !== value) {
                this.model.set('scrollLeft', this.el.scrollLeft);
            }
        }
    },

    /**
     * 랜더링 한다.
     * @return {Container}
     */
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        this.selection = this.createView(Selection, {
            grid: this.grid,
            model: this.model
        });

        this.body = this.createView(Body, {
            grid: this.grid,
            selection: this.selection,
            model: this.model
        });

        this.$el.empty()
            .append(this.body.render().el)
            .append(this.selection.render().el);

        this._attachHandler();
        return this;
    }
});

/**
 * @fileoverview Header View
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Header View
 * @constructor Header
 */
var Header = ne.util.defineClass(Base.View, /**@lends Header.prototype */{
    className: 'infinite_header_container',
    style: 'overflow:hidden;position: relative;',
    /**
     * 생성자
     * @param {Object} attributes
     */
    init: function (attributes){
        Base.View.prototype.init.apply(this, arguments);
        this.model.on('change', this._onModelChange, this);
        this.setOwnProperties({
            resizeHandler: null
        });
    },
    _template: {
        table: '' +
        '<div class="infinite_header">' +
        '<table width="100%" border="0" cellpadding="0" cellspacing="' +
        '<%=border%>' +
        '" ' +
        'style="' +
        'table-layout:fixed;' +
        '"' +
        '>' +
        '<colgroup>' +
        '<%=col%>' +
        '</colgroup>' +
        '<tbody>' +
        '<%=tbody%>' +
        '</tbody>' +
        '</div>'
    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     *
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'width') {
            this._setContainerWidth(value);
        } else if (key === 'scrollLeft') {
            this.$el[0].scrollLeft = value;
        } else if (key === 'columnWidthList') {
            this._changeColumnWidth(value);
        }
    },

    /**
     * Model Change 이벤트 핸들러로부터 columnWidthList 를 전달받아, 현재 table의
     * 각 열의 너비를 조정한다.
     * @param {Array} columnWidthList 컬럼 너비 리스트
     * @private
     */
    _changeColumnWidth: function(columnWidthList) {
        var $colList = this.$el.find('colgroup').find('col');

        ne.util.forEachArray(columnWidthList, function(width, index) {
            $colList.eq(index).width(width);
        }, this);
    },

    /**
     * 랜더링 한다.
     * @return {Header}
     */
    render: function() {
        this._detachHandler();
        this.destroyChildren();

        var columnModelList = this.grid.option('columnModelList'),
            border = this.grid.option('border'),
            tbody = '',
            html,
            height = this.model.headerHeight,
            col = '',
            color = this.grid.option('color'),
            resizeHandler;

        ne.util.forEachArray(columnModelList, function() {
            col += '<col></col>';
        }, this);

        tbody += '<tr style="height:' + height + 'px">';
        ne.util.forEachArray(columnModelList, function(columnModel) {
            tbody += '<th columnname="' + columnModel['columnName'] + '" style="' +
            'overflow:hidden;white-space:nowrap;*white-space:pre;text-align:center;padding:0;border:0;' +
            '">' + columnModel['title'] + '</th>';
        });
        tbody += '</tr>';

        html = Util.template(this._template.table, {
            border: border,
            col: col,
            tbody: tbody
        });

        this.$el.html(html);
        this._setContainerWidth(this.model.width);
        this.$el.find('table').css('background', color['border']);
        this.$el.find('th').css('background', color['th']);

        if (border === 0) {
            this.$el.css('border', 'solid 1px ' + color['border']);
            this.$el.css('border-bottom', '0px');
        }
        //resize 를 사용한다면 resize handler 를 추가한다.
        if (this.grid.option('useColumnResize')) {
            this.resizeHandler = this.createView(ResizeHandlerContainer, {
                grid: this.grid,
                model: this.model,
                height: height
            });
            this.$el.append(this.resizeHandler.render().el);
        }
        if (!this.grid.option('hasHeader')) {
            this.$el.css({
                height: '0px',
                width: '0px',
                border: 0
            });
        }
        this._attachHandler();
        return this;
    },

    /**
     * Model 의 변경된 width 값을 받아 container 의 width 를 결정한다.
     * @param {(Number|String)} width 너비값
     * @private
     */
    _setContainerWidth: function(width) {
        //spacer 만큼 너비를 계산하여 padding 을 설정한다.
        var padding = this.grid.option('border') * 6 + this.grid.scrollBarSize;

        if (width === 0) {
            width = '100%';
        } else {
            width = width + 'px';
        }
        this.$el.find('.infinite_header:first').css({
            'width': width,
            'paddingRight': padding + 'px'
        });
    }
});

/**
 * @fileoverview Key 입력을 담당하는 파일
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Keyboard
 * @constructor Keyboard
 */
var Keyboard = ne.util.defineClass(Base.View, /**@lends Keyboard.prototype */{
    keyMap: {
        'PAGE_UP': 33,
        'PAGE_DOWN': 34,
        'LEFT_ARROW': 37,
        'UP_ARROW': 38,
        'RIGHT_ARROW': 39,
        'DOWN_ARROW': 40,
        'HOME': 36,
        'END': 35,
        'CHAR_A': 65,
        'CHAR_C': 67,
        'CTRL': 17,
        'META': 91,
        'SHIFT': 16
    },
    eventHandler: {
        'keydown': '_onKeyDown',
        'keyup': '_onKeyUp',
        'blur': '_onBlur',
        'focus': '_onFocus'
    },
    tagName: 'textarea',
    style: 'position: absolute; width: 0; height: 0; top:0; left: -9999px;',
    /**
     * 생성자
     * @param {Object} attributes
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
    },

    /**
     * focus event handler
     * @param {event} focusEvent focus 이벤트
     * @private
     */
    _onFocus: function(focusEvent) {
        this.grid.getSelectionInstance().show();
    },

    /**
     * blur event handler
     * @param {event} blurEvent blur 이벤트
     * @private
     */
    _onBlur: function(blurEvent) {
        this.model.collection.unlock();
        this.grid.blur();
    },

    /**
     * keyUp event handler
     * @param {event} keyUpEvent keyup 이벤트
     * @private
     */
    _onKeyUp: function(keyUpEvent) {
        this.model.collection.unlock();
    },

    /**
     * keyDown 시 이벤트 핸들러
     * @param {event} keyDownEvent keydown 이벤트
     * @private
     */
    _onKeyDown: function(keyDownEvent) {
        var scrollTop,
            keyIdentified = true,
            keyCode = keyDownEvent.which ? keyDownEvent.which : keyDownEvent.keyCode;
        this.model.collection.lock();
        switch (keyCode) {
            case this.keyMap.SHIFT:
                break;
            case this.keyMap.CTRL:
                break;
            case this.keyMap.META:
                break;
            case this.keyMap.UP_ARROW:
                this.scrollVertical(-this.grid.scrollingScale);
                break;
            case this.keyMap.DOWN_ARROW:
                this.scrollVertical(this.grid.scrollingScale);
                break;
            case this.keyMap.LEFT_ARROW:
                this.scrollHorizontal(-this.grid.scrollingScale);
                break;
            case this.keyMap.RIGHT_ARROW:
                this.scrollHorizontal(this.grid.scrollingScale);
                break;
            case this.keyMap.PAGE_UP:
                this.scrollVertical(-this.grid.scrollingScalePerPage, true);
                break;
            case this.keyMap.PAGE_DOWN:
                this.scrollVertical(this.grid.scrollingScalePerPage, true);
                break;
            case this.keyMap.HOME:
                this.model.set('scrollTop', 0);
                break;
            case this.keyMap.END:
                this.model.set('scrollTop', this.model.maxScrollTop);
                break;
            case this.keyMap.CHAR_A:
                if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
                    keyDownEvent.preventDefault();
                    this.grid.getSelectionInstance().selectAll();
                }
                break;
            case this.keyMap.CHAR_C:
                if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
                    this._keyDownForCopy();
                }
                break;
            default :
                keyIdentified = false;
                break;
        }
        if (keyIdentified && !this.grid.option('keyEventBubble')) {
            keyDownEvent.stopPropagation();
        }
    },

    /**
     * copy를 위한 keydown event 가 발생했을 경우 데이터를 clipboard 에 설정한다.
     * @private
     */
    _keyDownForCopy: function() {
        /* istanbul ignore next: select, focus 검증할 수 없음 */
        var text = this.grid.getSelectionInstance().getSelectionData().join('\n');
        if (window.clipboardData) {
            if (window.clipboardData.setData('Text', text)) {
                this.$el.select();
            } else {
                this.$el.val('').select();
            }
        } else {
            this.$el.val(text).select();
        }
    },

    /**
     * 세로 스크롤 한다.
     * @param {number} pixel    이동할 픽셀값
     * @param {boolean} [isPercentage=false] 퍼센티지로 계산할지 여부
     */
    scrollVertical: function(pixel, isPercentage) {
        pixel = isPercentage ? Math.floor(this.model.height * (pixel / 100)) : pixel;
        var scrollTop = Math.max(0, this.model.scrollTop + pixel);
        this.model.set('scrollTop', scrollTop);
    },

    /**
     * 가로 스크롤 한다.
     * @param {number} pixel 이동할 픽셀값
     */
    scrollHorizontal: function(pixel) {
        var scrollLeft = Math.max(0, this.model.scrollLeft + pixel);
        this.model.set('scrollLeft', scrollLeft);
    },

    /**
     * 랜더링 한다.
     * @return {Keyboard}
     */
    render: function() {
        this._detachHandler();
        this._attachHandler();
        return this;
    }
});

/**
 * @fileoverview 리사이즈 핸들러
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * ResizeHandlerContainer
 * @constructor ResizeHandlerContainer
 */
var ResizeHandlerContainer = ne.util.defineClass(Base.View, /**@lends ResizeHandlerContainer.prototype */{
    className: 'infinite_resize_handler_container',
    eventHandler: {
        'mousedown .infinite_resize_handler' : '_onMouseDown'
    },
    style: 'position:relative;width:0px;',

    /**
     * 생성자
     * @param {Object} attributes
     *      @param {number} attributes.height  핸들러의 높이값.
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.setOwnProperties({
            height: attributes.height,
            isResizing: false,     //현재 resize 발생 상황인지
            $target: null,         //이벤트가 발생한 target resize handler
            differenceLeft: 0,
            initialWidth: 0,
            initialOffsetLeft: 0,
            initialLeft: 0,
            useSelectionStatus: null
        });
        this.height = attributes.height;
        this.model.on('change', this._onModelChange, this);
    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key;

        if (key === 'columnWidthList') {
            this._refreshHandlerPosition();
        }
    },

    /**
     * 렌더링 한다.
     * @return {ResizeHandlerContainer}
     */
    render: function() {
        var columnModelList = this.grid.option('columnModelList'),
            length = columnModelList.length,
            handler;

        this._detachHandler();
        this.destroyChildren();
        this.$el.empty();

        ne.util.forEachArray(columnModelList, function(columnModel, index) {
            handler = this.createView(ResizeHandler, {
                grid: this.grid,
                index: index,
                columnName: columnModel.columnName,
                isLast: index === length - 1
            });
            this.$el.append(handler.render().el);
        }, this);
        this.$el.css({
            height: this.height + 'px',
            marginTop: -this.height + 'px'
        });
        this._attachHandler();
        this._refreshHandlerPosition();
        return this;
    },

    /**
     * 생성된 핸들러의 위치를 갱신한다.
     * @private
     */
    _refreshHandlerPosition: function() {
        var columnWidthList = this.model.columnWidthList,
            $resizeHandleList = this.$el.find('.infinite_resize_handler'),
            border = this.grid.option('border'),
            $colList = this.grid.view.header.$el.find('th'),
            curPos = 0,
            width,
            $handler;

        ne.util.forEachArray($resizeHandleList, function(item, index) {
            width = $colList.eq(index).width() || columnWidthList[index];
            $handler = $resizeHandleList.eq(index);

            curPos += width + border;
            //핸들러를 가운데 위치 시키기 위해 핸들러 너비 절반의 올림값(4)만큼 좌로 이동한다.
            $handler.css('left', (curPos - 4) + 'px');
        }, this);
    },

    /**
     * mousedown 이벤트 핸들러
     * @param {event} mouseDownEvent    마우스 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        this.useSelectionStatus = this.grid.option('useSelection');
        this.grid.option('useSelection', false);
        this._startResizing(mouseDownEvent);
    },

    /**
     * mouseup 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        this.grid.option('useSelection', this.useSelectionStatus);
        this._stopResizing();
    },

    /**
     * mousemove 이벤트 핸들러
     * @param {event} mouseMoveEvent    마우스 이벤트 객체
     * @private
     */
    _onMouseMove: function(mouseMoveEvent) {
        /* istanbul ignore else */
        if (this._isResizing()) {
            mouseMoveEvent.preventDefault();

            var left = mouseMoveEvent.pageX - this.initialOffsetLeft,
                width = this._calculateWidth(mouseMoveEvent.pageX),
                index = parseInt(this.$target.attr('columnindex'), 10);

            this.$target.css('left', left + 'px');
            this.model.setColumnWidth(index, width);
        }
    },

    /**
     * 너비를 계산한다.
     * @param {number} pageX    마우스의 x 좌표
     * @return {number} x좌표를 기준으로 계산한 width 값
     * @private
     */
    _calculateWidth: function(pageX) {
        var difference = pageX - this.initialOffsetLeft - this.initialLeft;
        return this.initialWidth + difference;
    },

    /**
     * 현재 mouse move resizing 중인지 상태 flag 반환
     * @return {boolean}    현재 resize 중인지 여부
     * @private
     */
    _isResizing: function() {
        return !!this.isResizing;
    },

    /**
     * resize start 세팅
     * @param {event} mouseDownEvent 마우스 이벤트
     * @private
     */
    _startResizing: function(mouseDownEvent) {
        var columnWidthList = this.model.columnWidthList,
            $target = $(mouseDownEvent.target);

        this.isResizing = true;
        this.$target = $target;
        this.initialLeft = parseInt($target.css('left').replace('px', ''), 10);
        this.initialOffsetLeft = this.$el.offset().left;
        this.initialWidth = columnWidthList[$target.attr('columnindex')];
        $('body')
            .bind('mousemove', $.proxy(this._onMouseMove, this))
            .bind('mouseup', $.proxy(this._onMouseUp, this))
            .css('cursor', 'col-resize');
    },

    /**
     * resize stop 세팅
     * @private
     */
    _stopResizing: function() {
        this.isResizing = false;
        this.$target = null;
        this.initialLeft = 0;
        this.initialOffsetLeft = 0;
        this.initialWidth = 0;
        $('body')
            .unbind('mousemove', $.proxy(this._onMouseMove, this))
            .unbind('mouseup', $.proxy(this._onMouseUp, this))
            .css('cursor', 'default');
    }
});

/**
 * ResizeHandler
 * @constructor ResizeHandler
 */
var ResizeHandler = ne.util.defineClass(Base.View, /**@lends ResizeHandler.prototype */{
    className: 'infinite_resize_handler',
    style: 'float:left; position:absolute; height:100%; opacity:0; filter:alpha(opacity=0); cursor:col-resize;',
    handlerWidth: 7,
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.setOwnProperties({
            columnName: attributes.columnName,
            index: attributes.index,
            isLast: attributes.isLast
        });
    },

    /**
     * 랜더링한다
     * @returns {ResizeHandler}
     */
    render: function() {
        var color = this.grid.option('color').border;
        this._detachHandler();
        this.destroyChildren();
        this.$el.empty();
        this.$el.attr({
            'columnindex': this.index,
            'columnname': this.columnName,
            'title': '마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있습니다.'
        }).css({
            'background': color
        });
        if (this.isLast) {
            //마지막 핸들러는 절반 이하의 크기를 가져야 하기 때문에 핸들러 크기의 절반값의 내림값을 설정한다.
            this.$el.width(Math.floor(this.handlerWidth / 2));
        } else {
            this.$el.width(this.handlerWidth);
        }
        this._attachHandler();
        return this;
    }
});

/**
 * @fileoverview Selection 영역을 담당
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Selection view Class
 * @constructor Selection
 */
var Selection = ne.util.defineClass(Base.View, /**@lends Selection.prototype */{
    eventHandler: {
        'mousedown': '_onMouseDown'
    },
    className: 'infinite_selection_layer',
    style: 'display:none;position:absolute;top:0;left:1px;width:0;height:0;border:dotted 1px red;' +
    'background:orange;opacity:0.2;filter:alpha(opacity=10)',
    /**
     * 생성자
     * @param {Object} attributes
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.grid.view.keyboard.on({
            'blur': this.stopSelection
        }, this);
        this.model.on({
            'change': this._onModelChange
        }, this);
        this.setOwnProperties({
            rangeKey: [-1, -1],
            isShown: false
        });
        this.setOwnProperties({
            selectionHandler: {
                'mousemove': $.proxy(this._onMouseMove, this),
                'mouseup': $.proxy(this._onMouseUp, this),
                'selectstart': $.proxy(this._onSelectStart, this)
            },
            timeoutForUpdateSelection: 0,
            startPageX: 0,
            startPageY: 0,
            mousePos: {
                pageX: 0,
                pageY: 0
            }
        });
    },

    /**
     * 마우스 이벤트 핸들러를 attach 한다.
     * @param {event} mouseEvent    마우스 이벤트 핸들러
     */
    attachMouseEvent: function(mouseEvent) {
        if (this.grid.option('useSelection')) {
            this.setOwnProperties({
                startPageX: mouseEvent.pageX,
                startPageY: mouseEvent.pageY
            });
            this._setMousePos(mouseEvent);
            $(document).on('mousemove', this.selectionHandler.mousemove);
            $(document).on('mouseup', this.selectionHandler.mouseup);
            $(document).on('selectstart', this.selectionHandler.selectstart);
        }
    },

    /**
     * 마우스 이벤트 핸들러를 detach 한다.
     */
    detachMouseEvent: function() {
        $(document).off('mousemove', this.selectionHandler.mousemove);
        $(document).off('mouseup', this.selectionHandler.mouseup);
        $(document).off('selectstart', this.selectionHandler.selectstart);
    },

    /**
     * Mouse down 이벤트 핸들러
     * @param {event} mouseDownEvent    마우스 이벤트 핸들러
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        var pageX = mouseDownEvent.pageX,
            pageY = mouseDownEvent.pageY,
            key = this.getKey(pageX, pageY);

        this.attachMouseEvent(mouseDownEvent);
        this.grid.focusModel.select(key);
        if (mouseDownEvent.shiftKey) {
            if (!this.hasSelection()) {
                this.startSelection(key);
            }
            this.updateSelection(key);
        } else {
            this.stopSelection();
        }
    },

    /**
     * Mouse move 이벤트 핸들러
     * @param {event} mouseMoveEvent    마우스 이벤트 핸들러
     * @private
     */
    _onMouseMove: function(mouseMoveEvent) {
        this._setMousePos(mouseMoveEvent);
        if (this.hasSelection()) {
            clearTimeout(this.timeoutForUpdateSelection);
            this.timeoutForUpdateSelection = setTimeout($.proxy(this._scrollOnSelection, this), 0);
            this.updateSelection();
        } else if (this._getDistance(mouseMoveEvent) > 10) {
            this.startSelection(this.getKey(this.startPageX, this.startPageY));
        }
    },

    /**
     * MouseUp 이벤트 핸들러
     * @param {event} mouseUpEvent  마우스 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        this.detachMouseEvent();
    },

    /**
     * selection start 시 영역 선택하지 않도록 prevent default
     * @param {event} selectStartEvent  이벤트 핸들러
     * @return {boolean}
     * @private
     */
    _onSelectStart: function(selectStartEvent) {
        /* istanbul ignore next: selectStartEvent 확인 불가 */
        selectStartEvent.preventDefault();
        return false;
    },

    /**
     * selection 시 mouse pointer 가 영역을 벗어났을 시 자동 scroll 한다.
     * @private
     */
    _scrollOnSelection: function() {
        if (this.hasSelection()) {
            var status = this.overflowStatus(this.mousePos.pageX, this.mousePos.pageY);
            if (status.y > 0) {
                this.model.set('scrollTop', this.model.scrollTop + this.grid.scrollingScale);
            } else if (status.y < 0) {
                this.model.set('scrollTop', this.model.scrollTop - this.grid.scrollingScale);
            }
            if (status.x > 0) {
                this.model.set('scrollLeft', this.model.scrollLeft + this.grid.scrollingScale);
            } else if (status.x < 0) {
                this.model.set('scrollLeft', this.model.scrollLeft - this.grid.scrollingScale);
            }
        }
    },

    /**
     * mousedown 이 처음 일어난 지점부터의 거리를 구한다.
     * @param {event} mouseMoveEvent    마우스 이벤트
     * @return {number} 피타고라스 정리를 이용한 거리.
     * @private
     */
    _getDistance: function(mouseMoveEvent) {
        var pageX = mouseMoveEvent.pageX,
            pageY = mouseMoveEvent.pageY,
            x = Math.abs(this.startPageX - pageX),
            y = Math.abs(this.startPageY - pageY);
        return Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    },

    /**
     * 내부 변수로 mouse position 을 저장한다.
     * @param {event} mouseEvent    마우스 이벤트
     * @private
     */
    _setMousePos: function(mouseEvent) {
        this.mousePos.pageX = mouseEvent.pageX;
        this.mousePos.pageY = mouseEvent.pageY;
    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     *
     * @param {{key:number, value: value}} changeEvent  Change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'headerHeight' || key === 'top') {
            this.draw();
        } else if (key === 'width') {
            this.$el.width(value - 3);
        }
    },

    /**
     * selection range 를 반환한다.
     * @return {Array}  범위의 키값. [startKey, endKey]
     */
    getSelectionRange: function() {
        return this.rangeKey;
    },

    /**
     * selection 된 시작과 끝 영역의 index 를 리턴한다.
     * @return {Array} 범위의 인덱스값. [startIndex, endIndex]
     */
    getSelectionRangeIndex: function() {
        var collection = this.model.collection,
            range = [
               collection.indexOf(collection.get(this.rangeKey[0])),
               collection.indexOf(collection.get(this.rangeKey[1]))
            ],
            startIdx = Math.min.apply(Math, range),
            endIdx = Math.max.apply(Math, range);
        return [startIdx, endIdx];
    },

    /**
     * selection 데이터가 존재하는지 확인한다.
     * @return {boolean}
     */
    hasSelection: function() {
        return !(this.rangeKey[0] === -1);
    },

    /**
     * selection 된 영역의 length 를 반환한다.
     * @return {number}
     */
    getSelectionLength: function() {
        var range = this.getSelectionRangeIndex();
        return (range[1] + 1) - range[0];
    },

    /**
     * selection 을 시작한다.
     * @param {number} [key]    시작할 row 의 key
     */
    startSelection: function(key) {
        if (this.grid.option('useSelection')) {
            key = ne.util.isUndefined(key) ? this.getKey(this.mousePos.pageX, this.mousePos.pageY) : key;
            if (key !== -1) {
                this.rangeKey[0] = key;
                this.updateSelection(key);
            }
        }
    },

    /**
     * selection 영역을 update 한다.
     * @param {number} [key] 업데이트 된 row 의 key
     */
    updateSelection: function(key) {
        if (this.grid.option('useSelection')) {
            key = ne.util.isUndefined(key) ? this.getKey(this.mousePos.pageX, this.mousePos.pageY) : key;
            if (key !== -1) {
                this.rangeKey[1] = key;
                this.show();
            }
        }
    },

    /**
     * selection data 를 배열 형태로 가져온다.
     * @return {Array}
     */
    getSelectionData: function() {
        var range = this.getSelectionRangeIndex(),
            collectionList = this.model.collection.list.slice(range[0], range[1] + 1),
            columnModelList = this.grid.option('columnModelList'),
            rowStringList = [];

        ne.util.forEachArray(collectionList, function(collection) {
            var columnStringList = [];
            ne.util.forEachArray(columnModelList, function(columnModel) {
                var columnName = columnModel['columnName'],
                    data = collection.data,
                    value;
                if (ne.util.isFunction(columnModel.formatter)) {
                    value = columnModel.formatter(data[columnName], data);
                } else {
                    value = data[columnName];
                }
                columnStringList.push(Util.stripTags(value));
            });
            rowStringList.push(columnStringList.join('\t'));
        });
        return rowStringList;
    },

    /**
     * 전체 selection 한다.
     */
    selectAll: function() {
        var collection = this.model.collection;
        this.rangeKey = [collection.at(0).id, collection.at(collection.length - 1).id];
        this.draw();
    },

    /**
     * selection 을 중지한다.
     */
    stopSelection: function() {
        this.rangeKey = [-1, -1];
        this.draw();
    },

    /**
     * selection 영역을 보인다.
     */
    show: function() {
        this.isShown = true;
        this.draw();
    },

    /**
     * selection 영역을 감춘다.
     */
    hide: function() {
        this.isShown = false;
        this.draw();
    },

    /**
     * 마우스 포지션이 container 영역을 벗어났는지 확인한다.
     * @param {number} pageX    마우스 x좌표
     * @param {number} pageY    마우스 y 좌표
     * @return {{x: number, y: number}} x 또는 y 가 0보다 클 경우 + 방향으로 overflow. 작을경우 - 방향으로 overflow
     */
    overflowStatus: function(pageX, pageY) {
        var containerPosY = pageY - this.model.offsetTop - this.model.headerHeight,
            containerPosX = pageX - this.model.offsetLeft,
            status = {
                x: 0,
                y: 0
            };
        if (containerPosY > this.model.height + this.model.headerHeight) {
            status.y = 1;
        } else if (containerPosY < 0) {
            status.y = -1;
        }

        if (containerPosX > this.model.containerWidth) {
            status.x = 1;
        } else if (containerPosX < 0) {
            status.x = -1;
        }
        return status;
    },

    /**
     * 마우스 포지션에 해당하는 row 의 key 를 얻어온다.
     *
     * @param {number} pageX    마우스 x좌표
     * @param {number} pageY    마우스 y좌표
     * @return {(String|Number)} 해당 위치의 키값
     */
    getKey: function(pageX, pageY) {
        var model = this.model,
            scrollTop = model.scrollTop,
            rowHeight = model.rowHeight,
            offsetTop = model.offsetTop,
            height = model.height,
            border = this.grid.option('border'),
            headerHeight = model.headerHeight,
            containerPosY = pageY - offsetTop - headerHeight,
            dataPosY = scrollTop + containerPosY,
            status = this.overflowStatus(pageX, pageY),
            idx;
        if (status.y > 0) {
            dataPosY = scrollTop + height - 1;
        } else if (status.y < 0) {
            dataPosY = scrollTop + 1;
        }

        idx = Math.min(Math.max(0, Math.floor(dataPosY / (rowHeight + border))), model.collection.length - 1);
        return model.collection.at(idx) && model.collection.at(idx).id;
    },

    /**
     * 현재 정보를 가지고 selection 영역을 표시한다.
     */
    draw: function() {
        if (this.isShown && (this.rangeKey[0] !== -1 && this.rangeKey[1] !== -1)) {
            var collection = this.model.collection,
                border = this.grid.option('border'),
                start = collection.indexOf(collection.get(this.rangeKey[0])),
                end = collection.indexOf(collection.get(this.rangeKey[1])),
                totalRowCount = collection.length,
                startIdx = Math.min(start, end),
                endIdx = Math.max(start, end),
                top = Util.getHeight(startIdx, this.model.rowHeight, border) - border,
                height = Util.getHeight(((endIdx - startIdx) + 1), this.model.rowHeight, border),
                fixedTop, fixedDifference, fixedHeight,
                width = this.model.width - 3,
                display = 'block';

            fixedTop = Math.max(this.model.scrollTop - 10, top) - 1;
            fixedDifference = fixedTop - top;
            if (endIdx === totalRowCount) { }
            fixedHeight = Math.min(this.model.height + 10, height - fixedDifference) - 2;

            if (fixedHeight <= 0) {
                display = 'none';
            }

            //크기 줄이기 위해 보정

            this.$el.css({
                width: width + 'px',
                top: fixedTop + 'px',
                height: fixedHeight + 'px',
                display: display
            });
        } else {
            this.$el.css({
                display: 'none'
            });
            if (this.isShown) {
                this.grid.view.keyboard.$el.val('');
            }
        }
    },

    /**
     * 랜더링한다.
     * @return {Selection}
     */
    render: function() {
        var color = this.grid.option('color'),
            opacity = this.grid.option('opacity');

        this._detachHandler();
        this.$el.css({
            width: '100%',
            background: color['selection'],
            opacity: opacity
        });
        this.draw();

        this._attachHandler();
        return this;
    },

    /**
     * 소멸자
     */
    destroy: function() {
        this.detachMouseEvent();
        this.destroyChildren();
        this._detachHandler(this.$el);
        this.$el.empty().remove();
    }
});

/**
 * @fileoverview 테이블 헤더의 우측 영역(Scroll) 에 자리하는 Spacer View
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Spacer View
 * 테이블 헤더의 우측 영역(Scroll) 에 자리하는 Spacer View
 * @constructor Spacer
 */
var Spacer = ne.util.defineClass(Base.View, /**@lends Spacer.prototype */{
    eventHandler: {},
    className: 'infinite_spacer',
    style: 'display: block;	position: absolute;	top: 0;	right: 0; width: 16px;',
    /**
     * 생성자
     * @param attributes
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
    },

    /**
     * 렌더링 한다.
     * @return {Spacer}
     */
    render: function() {
        var grid = this.grid,
            color = grid.option('color'),
            height = grid.option('headerHeight'),
            border = grid.option('border'),
            top = border ? 0 : 1,
            right = border ? 0 : 1,
            width = 17 - border,
            css = {
                top: top + 'px',
                right: right + 'px',
                background: color['th'],
                height: height + 'px',
                width: width + 'px',
                border: 'solid ' + border + 'px ' + color['border']
            };

        this._detachHandler();
        this.destroyChildren();
        this.$el.css(css);
        this._attachHandler();
        return this;
    }
});

/**
 * @fileoverview 가상 스크롤바
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * VirtualScrollBar
 * @constructor VirtualScrollBar
 */
var VirtualScrollBar = ne.util.defineClass(Base.View, /**@lends VirtualScrollBar.prototype */{
    className: 'infinite_virtial_scrollbar',
    eventHandler: {
        'scroll': '_onScroll'
    },
    style: 'overflow-y: scroll; overflow-x: hidden; position: absolute; top: 0; right: 0; display: block;',
    /**
     * 생성자
     * @param attributes
     */
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
        this.model.on({
            'change': this._onModelChange
        }, this);
        this.setOwnProperties({
            timeoutIdForLock: 0,
            isScrollHandlerFocused: false
        });
    },

    /**
     * 마우스다운 event handler
     * @private
     */
    _onMouseDown: function() {
        this.model.collection.lock();
        this.grid.updateLayoutData();
        this.isScrollHandlerFocused = true;
        this._updateUnlockTimeout();
    },

    /**
     * 스크롤 핸들러로 스크롤 했을 때, unlock timer 를 업데이트 한다.
     * @private
     */
    _updateUnlockTimeout: function() {
        if (this.isScrollHandlerFocused) {
            clearTimeout(this.timeoutIdForLock);
            this.model.collection.lock();
            this.timeoutIdForLock = setTimeout($.proxy(function() {
                this.isScrollHandlerFocused = false;
                this.model.collection.unlock();
            }, this), 1000);
        }
    },

    /**
     * scroll event handler
     * @param {event} scrollEvent 스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        this.model.set('scrollTop', $(scrollEvent.target).scrollTop());
        this._updateUnlockTimeout();
        this.isScrollHandlerFocused = true;
    },

    /**
     * model 값이 변경되었을때 view 에 반영한다.
     *
     * @param {{key: key, value: value}} changeEvent model 에서 전달하는 change 이벤트
     * @private
     */
    _onModelChange: function(changeEvent) {
        var key = changeEvent.key,
            value = changeEvent.value;
        if (key === 'scrollTop') {
            this.isScrollHandlerFocused = false;
            this._onScrollTopChange(value);
        } else if (key === 'headerHeight') {
            this.$el.css('top', value + 'px');
        } else {
            this._setContentHeight();
        }
    },

    /**
     * scrollTop 값을 동기화한다.
     * @param {number} scrollTop    scrollTop 값
     * @private
     */
    _onScrollTopChange: function(scrollTop) {
        this.el.scrollTop = scrollTop;
    },

    /**
     * 현재 랜더링을 기준으로 max scroll top 을 확인한다.
     * @return {number} 계산된 max scroll top 값
     * @private
     */
    _getMaxScrollTop: function() {
        return this.$el.find('.infinite_content').height() - this.$el.innerHeight();
    },

    /**
     * 렌더링 한다.
     * @return {VirtualScrollBar}
     */
    render: function() {
        this._detachHandler();
        var width = this.grid.scrollBarSize + 1,
            right = (this.grid.option('border') === 0) ? 1 : 0,
            content = this.createView(VirtualScrollBar.Content, {
                grid: this.grid
            }),
            border = this.grid.option('border'),
            top;
        if (this.grid.option('hasHeader')) {
            top = this.grid.option('headerHeight') + ((border * 2) || 2);
        } else {
            top = 1;
        }

        this.$el.css({
            //height: this.grid.option('scrollX') ? this.model.height + this.grid.scrollBarSize : this.model.height,
            height: this.model.height,
            top: top,
            right: right,
            width: width + 'px'
        });
        this.$el.empty();
        this.$el.html(content.render().el);

        this._setContentHeight();
        this._attachHandler();
        return this;
    },

    /**
     * virtual scroll bar 의 높이를 계산하여 지정한다.
     * @private
     */
    _setContentHeight: function() {
        var border = this.grid.option('border'),
            rowHeight = this.grid.option('rowHeight'),
            rowCount = this.model.collection.length,
            height = Util.getHeight(rowCount, rowHeight, border),
            maxTop;
        //
        //if (this.grid.option('scrollX')) {
        //    height += this.grid.scrollBarSize;
        //}

        this.$el.find('.infinite_content').height(height);
        maxTop = this.model.getMaxScrollTop();
        this.model.set('maxScrollTop', maxTop);
    },

    /**
     * 가상 스크롤바의 content 영역의 높이를 가져온다.
     * @return {number} content 의 height 값
     * @private
     */
    _getContentHeight: function() {
        return this.$el.find('.infinite_content').height();
    }
});
/**
 * VirtualScrollBar.Content
 * @constructor VirtualScrollBar.Content
 */
VirtualScrollBar.Content = ne.util.defineClass(Base.View, /**@lends VirtualScrollBar.Content.prototype */{
    className: 'infinite_content',
    style: 'width: 1px; display: block; background: transparent;',
    init: function(attributes) {
        Base.View.prototype.init.apply(this, arguments);
    },
    render: function() {
        return this;
    }
});

/**
 * @fileoverview SimpleGrid 컴포넌트 본체
 * @author FE개발팀 박순영 <soonyoung.park@nhnent.com>
 */
/**
 * Simple Grid
 * @constructor
 * @example
 //Simple Grid 인스턴스 생성
    var simpleGrid = new ne.component.SimpleGrid({
        $el: $('#simpleGrid2'),
        rowHeight: 25,    //line 당 pixel
        displayCount: 20,  //영역에 보여줄 line 갯수
        headerHeight: 30,
        scrollX: false,
        scrollY: true,
        keyEventBubble: false,  //key 입력시 이벤트 버블링 할지 여부
        defaultColumnWidth: 50,
        //keyColumnName: 'column1',
        color: {
            border: 'red',
            th: 'yellow',
            td: '#FFFFFF',
            selection: 'blue'
        },
        className: {
            table: 'table_class',
            tr: 'tr_class',
            td: 'td_class'
        },
        border: 0,
        opacity: '0.5',
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
                title: '컬럼2',
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
        ]
    });
 */
ne.component.SimpleGrid = ne.util.defineClass(Base.View, /**@lends ne.component.SimpleGrid.prototype */{
    /**
     * 스크롤바 사이즈
     * @type {Number}
     */
    scrollBarSize: 17,

    /**
     * 방향키 스크롤 시 입력당 이동 단위 pixel
     * @type {Number}
     */
    scrollingScale: 40,

    /**
     * page up/ down 스크롤 시 입력당 이동 단위 %
     * @type {Number}
     */
    scrollingScalePerPage: 90,

    /**
     * IE 랜더링 가능한 MaxHeight 값. 1533917 is the max height of IE (66692*23 + 1)
     * @type {Number}
     */
    ieMaxHeight: 1533917,
    className: 'simple_grid',
    eventHandler: {
        'mouseover': '_onMouseOver',
        'mouseout': '_onMouseOut',
        'mousedown': '_onMouseDown',
        'focus': '_onFocus'
    },

    /**
     *  @param {Object} options 옵션 객체
     *      @param {jQuery} options.$el root 엘리먼트
     *      @param {number} [options.headerHeight=30]  header 영역의 높이값
     *      @param {number} [options.hasHeader=true] header 를 노출할지 여부.
     *      @param {number} [options.height]    grid 의 높이값. displayCount 보다 우선한다.
     *      @param {number} [options.useSelection=true]    selection 기능을 사용할 지 여부
     *      @param {number} [options.useColumnResize=true]    열 resize 기능을 사용할 지 여부
     *      @param {number} [options.rowHeight=20] 한 행의 높이값. height 가 설정될 경우 무시된다.
     *      @param {number} [options.displayCount=15] 한 화면에 보여질 행 개수
     *      @param {boolean} [options.scrollX=true] 가로 스크롤 사용 여부
     *      @param {boolean} [options.scrollY=true] 세로 스크롤 사용 여부
     *      @param {boolean} [options.scrollFix=true] prepend 로 데이터 추가 시 현재 scroll 위치 유지 여부
     *      @param {object} [options.defaultColumnWidth=50] 컬럼 모델에 너비 값을 지정하지 않았을 때 설정될 기본 column 너비
     *      @param {object} [options.minimumColumnWidth=20] resize 시 최소 컬럼 너비값
     *      @param {object} [options.idAttribute=null] 행의 key 값으로 사용될 필드명. 값을 지정하지 않을경우 내부에서 자동으로 값을 생성한다.
     *      @param {object} [options.columnModelList=[]] 컬럼모델 정보
     *          @param {string} [options.columnModelList.columnName] data field 명
     *          @param {string} [options.columnModelList.title] Header 영역에 표시될 컬럼 이름
     *          @param {(number|string)} [options.columnModelList.width] 해당 컬럼의 너비. %로 지정할 수 있음
     *          @param {string} [options.columnModelList.align] 해당 컬럼의 정렬기준
     *          @param {function} [options.columnModelList.formatter] 데이터를 화면에 표시할 때 값의 포맷팅 처리를 하기 위한 함수.
     *          값을 출력하기 전에 formatter 함수에 해당 컬럼의 값을 전달하고 해당 함수가 리턴한 값을 화면 상에 표시한다.
     *      @param {object} [options.opacity=0.2] 선택 영역 레이어 투명도
     *      @param {object} [options.border=1] 테이블 border 두께
     *      @param {object} [options.color] 색상 정보
     *          @param {string} [options.color.border='#EFEFEF']  태두리 색상
     *          @param {string} [options.color.th='#F8F8F8']  테이블 헤더 색상
     *          @param {string} [options.color.td='#FFFFFF']  테이블 바디 색상
     *          @param {string} [options.color.selection='orange']  선택영역 색상
     *      @param {object} [options.className] table 의 디자인 클래스 정보
     *          @param {string} [options.className.table]   table 의 className 정의
     *          @param {string} [options.className.tr]  tr의 className 정의
     *          @param {string} [options.className.td]  td의 className 정의
     * @return {ne.component.SimpleGrid}
     */
    init: function(options) {
        Base.View.prototype.init.apply(this, arguments);

        var id = this.getUniqueKey(),
            defaultOptions = {
                rowHeight: 20,    //line 당 pixel
                displayCount: 10,  //영역에 보여줄 line 갯수
                headerHeight: 30,
                scrollX: true,
                scrollY: true,
                freeze: true,    //Data Prepend 시 현재  scroll 된 위치를 유지할 것인지 여부
                keyEventBubble: false,  //key 입력시 이벤트 버블링 할지 여부
                idAttribute: null,
                columnModelList: [],
                defaultColumnWidth: 50,
                useSelection: true,
                useColumnResize: true,
                hasHeader: true,
                minimumColumnWidth: 20,
                className: {
                    table: '',
                    tr: '',
                    td: ''
                },
                color: {
                    border: '#EFEFEF',
                    th: '#F8F8F8',
                    td: '#FFFFFF',
                    selection: 'orange'
                },
                border: 1,
                opacity: '0.2'
            };

        this.__instance[id] = this;
        options = $.extend(true, defaultOptions, options);

        this.setOwnProperties({
            id: id,
            model: null,
            focusModel: null,
            view: {
                header: null,
                spacer: null,
                container: null,
                virtualScroll: null,
                keyboard: null
            },
            options: options,
            timeoutIdForBlur: 0
        });
        if (!this.option('hasHeader')) {
            this.option('headerHeight', 0);
        }
        this._initializeModel();
        this._initializeView();
        this.render();
        this._initializeCustomEvent();
        return this;
    },

   /**
     * 커스텀 이벤트를 초기화 한다.
     * @private
     */
    _initializeCustomEvent: function() {
        this.view.container.body.on('click', function(customEvent) {
            return this.invoke('click', customEvent);
        }, this);
    },

    /**
     * focus 발생시 이벤트 핸들러
     */
    focus: function() {
        this.view.keyboard.$el.focus().select();
    },

    /**
     * blur 발생시 selection 영역 숨김처 한다.
     */
    blur: function() {
        this.view.container.selection.hide();
    },

    /**
     * view 에서 참조할 모델을 초기화한다.
     * @private
     */
    _initializeModel: function() {
        this.model = new Model({
            grid: this
        });
        this.focusModel = new Focus({
            grid: this
        });
    },

    /**
     * 내부에서 사용할 view 를 초기화한다.
     * @private
     */
    _initializeView: function() {
        this.view.header = this.createView(Header, {
            grid: this,
            model: this.model
        });
        this.view.spacer = this.createView(Spacer, {
            grid: this,
            model: this.model
        });
        this.view.container = this.createView(Container, {
            grid: this,
            model: this.model
        });
        this.view.keyboard = this.createView(Keyboard, {
            grid: this,
            model: this.model
        });
    },

    /**
     * 마우스 down 이벤트 핸들러
     * @private
     */
    _onMouseDown: function() {
        $(document).on('mouseup', $.proxy(this._onMouseUp, this));
        this.model.collection.lock();
        this.updateLayoutData();
        clearTimeout(this.timeoutIdForBlur);
        this.timeoutIdForBlur = setTimeout($.proxy(function() {
            this.focus();
        }, this), 0);
    },

    /**
     * 마우스 up 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        this.model.collection.unlock();
        $(document).off('mouseup', $.proxy(this._onMouseUp, this));
    },

    /**
     * 선택영역 selection instance 를 반환한다. 내부 수행 로직에 사용된다.
     * @return {Object} Selection 인스턴스
     */
    getSelectionInstance: function() {
        return this.view.container.selection;
    },

    /**
     * scroll content 에 노출될 data list 를 저장한다.
     * @param {array} list
     * @return {ne.component.SimpleGrid}
     * @example
     simpleGrid.setList([
        {
            column1: 1,
            column2: 2,
            column3: 3,
            column4: 4,
            column5: 5
        },
        {
            column1: 1,
            column2: 2,
            column3: 3,
            column4: 4,
            column5: 5
        }
     ]);
     */
    setList: function(list) {
        this.clear();
        this.model.collection.set(list);
        return this;
    },

    /**
     * id 에 해당하는 row 를 삭제한다.
     * @param {*} id 삭제할 키값 혹은 키값의 list
     * @return {ne.component.SimpleGrid}
     */
    remove: function(id) {
        var idList = ne.util.isArray(id) ? id : [id];
        this.model.collection.remove(idList);
        return this;
    },

    /**
     * scroll content 에 노출될 data list 를 append 한다.
     *
     * @param {array} list append 할 데이터 list
     * @return {ne.component.SimpleGrid}
     */
    append: function(list) {
        this.model.collection.append(list);
        return this;
    },

    /**
     * scroll content 에 노출될 data list 를 prepend 한다.
     * @param {array} list prepend 할 데이터 list
     * @return {ne.component.SimpleGrid}
     */
    prepend: function(list) {
        this.model.collection.prepend(list);
        return this;
    },

    /**
     * 노출된 데이터를 전부 제거 한다.
     * @return {ne.component.SimpleGrid}
     */
    clear: function() {
        this.model.collection.clear();
        return this;
    },

    /**
     * 현재 Grid 에 저장된 데이터 정보를 가져온다.
     * @return {list|*|Collection.list}
     */
    getList: function() {
        return this.model.collection.list;
    },

    /**
     * 랜더링한다.
     * @return {ne.component.SimpleGrid}
     */
    render: function() {
        this.destroyChildren();
        this._detachHandler();
        this.$el.attr({
            instanceId: this.id
        }).css({
            position: 'relative'
        });
        this.$el.empty();

        this.$el.append(this.view.header.render().el)
            .append(this.view.spacer.render().el);

        this.$el.append(this.view.container.render().el)
            .append(this.view.keyboard.render().el);

        if (this.option('scrollY')) {
            this.view.virtualScroll = this.createView(VirtualScrollBar, {
                grid: this,
                model: this.model
            });
            this.$el.append(this.view.virtualScroll.render().el);
        }
        this.updateLayoutData();
        this._attachHandler();
        return this;
    },

    /**
     * model 의 layout 관련 데이터를 갱신한다.
     */
    updateLayoutData: function() {
        var offset = this.$el.offset();
        this.model.set({
            offsetTop: offset.top,
            offsetLeft: offset.left,
            containerWidth: this.view.container.$el.width(),
            containerHeight: this.view.container.$el.height()
        });
    },

    /**
     * 설정된 옵션값을 가져오거나 변경한다.
     * @param {(number | string)} key
     * @param {*} [value]
     * @return {*}
     */
    option: function(key, value) {
        if (value === undefined) {
            return this.options[key];
        } else {
            this.options[key] = value;
            return this;
        }
    }
});
/* istanbul ignore next*/
ne.component.SimpleGrid.prototype.__instance = {};
/**
 * id 에 해당하는 인스턴스를 반환한다.
 * @param {number} id
 * @return {object}
 */
ne.component.SimpleGrid.getInstanceById = function(id) {
    return this.__instance[id];
};

})();