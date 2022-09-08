//@ts-check
const createWorkerpool = (options) => {
    const workers = new Map(Array.from({
        length: options.workers
    }).map(() => {
        const w = new Worker(new URL("./alt-worker.js", import.meta.url).href, {
            type: "module"
        });
        const workerId = Math.random() * 1000 | 0;
        return [
            workerId,
            w
        ];
    }));
    const idle = Array.from(workers.keys());
    const resolvers = new Map();
    const backlog = [];
    let taskIdCounter = 0;
    let terminating = false;
    const runNext = () => {
        if (terminating) return;
        if (backlog.length == 0 || idle.length == 0) return;
        const task = backlog.shift();
        const workerId = idle.shift();
        if (!task) return;
        if (!workerId) return;
        console.log(`scheduling ${task.id} on ${workerId}`);
        const msg = {
            ...task,
            task: task.task.toString()
        };
        const worker = workers.get(workerId);
        worker?.postMessage(msg);
        runNext();
    };
    workers.forEach((w, i) => {
        const onMessage = (evt) => {
            const { id, result } = evt.data;
            console.log("res", result);
            const resolver = resolvers.get(id);
            resolver?.(result);
            resolvers.delete(id);
            idle.push(i);
            runNext();
        };
        w.onmessage = onMessage;
    });
    return {
        createTask(f) {
            return {
                runAsync(data) {
                    if (terminating) {
                        return Promise.reject(new Error("Workerpool is terminating"));
                    }
                    taskIdCounter += 1;
                    backlog.push({
                        id: taskIdCounter,
                        task: f,
                        data
                    });
                    const p = new Promise((r) => resolvers.set(taskIdCounter, r));
                    runNext();
                    return p;
                }
            };
        },
        async terminate() {
            terminating = true;
            await new Promise((resolve) => {
                setInterval(() => idle.length == workers.size ? resolve(null) : null, 10);
            });
            console.log("all workers empty");
            await Promise.all(Array.from(workers.values()).map((v) => v.terminate()));
        }
    };
};
const pool = createWorkerpool({
    workers: 2
});
const task = ({array, index, val}) => {
    console.log("🦊>>>> ~ funka ~ {array, i, val}", {array, index, val})
    array[index] = val;
};

console.log("💀💀💸 hello from the working pool");
const sab = new SharedArrayBuffer(12);
const ar = new Int32Array(sab);

const daTask = pool.createTask(task);

(async function() {
    await daTask.runAsync({array: ar, index: 0, val: 0xdead});
    console.log("💰💰", ar)
    await daTask.runAsync({array: ar, index: 1, val: 0xbeef});
    console.log("💰💰", ar)
    await daTask.runAsync({array: ar, index: 2, val: 0xbabe});
    console.log("💰💰", ar)
})()