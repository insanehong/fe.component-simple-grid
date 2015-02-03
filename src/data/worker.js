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
