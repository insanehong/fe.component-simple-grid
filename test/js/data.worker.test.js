'use strict';
describe('data.worker 테스트', function() {
    var instance;
    beforeEach(function() {
        instance = new Worker();
    });

    describe('enqueue 테스트', function() {
        it('lock 이 걸려있지 않다면 바로 수행한다.', function() {
            var job = jasmine.createSpy('job');
            instance.enqueue(job, [1, 2, 3], this);
            expect(job).toHaveBeenCalledWith(1, 2, 3);
        });
        it('lock 이 걸려있다면 queue 에 넣는다.', function() {
            var job = jasmine.createSpy('job');
            instance.lock();
            instance.enqueue(job, [1, 2, 3], this);
            expect(job).not.toHaveBeenCalled();
            instance.enqueue(job, [1, 2, 3], this);
            instance.enqueue(job, [1, 2, 3], this);
            expect(instance.queue.length).toBe(3);
        });
    });
    describe('dequeue 테스트', function() {
        beforeEach(function() {
            instance.lock();
        });
        it('dequeue 한다.', function() {
            var job = jasmine.createSpy('job');

            instance.enqueue(job, [1], this);
            instance.enqueue(job, [2], this);
            instance.enqueue(job, [3], this);

            expect(instance.queue.length).toEqual(3);
            expect(instance.dequeue().args).toEqual([1]);
            expect(instance.queue.length).toEqual(2);
            expect(instance.dequeue().args).toEqual([2]);
            expect(instance.queue.length).toEqual(1);
            expect(instance.dequeue().args).toEqual([3]);
            expect(instance.queue.length).toEqual(0);
        });
    });
    describe('unlock 테스트', function() {
        var job,
            newJob;
        beforeEach(function() {
            instance.lock();
            job = jasmine.createSpy('job');
            newJob = jasmine.createSpy('new');
            instance.enqueue(job, [1], this);
            instance.enqueue(job, [2], this);
            instance.enqueue(job, [3], this);
        });
        it('unlock 하며 queue 에 적제된 job 을 수행한다.', function() {
            expect(job).not.toHaveBeenCalled();
            instance.unlock();
            expect(job.calls.count()).toBe(3);
            instance.enqueue(newJob, [1], this);
            expect(newJob).toHaveBeenCalled();
        });
        it('파라미터를 true로 주면 queue 에 적제된 job 을 skip 한다.', function() {
            expect(job).not.toHaveBeenCalled();
            instance.unlock(true);
            expect(job).not.toHaveBeenCalled();
            instance.enqueue(newJob, [1], this);
            expect(newJob).toHaveBeenCalled();
            expect(job).not.toHaveBeenCalled();

        });
    });
});
