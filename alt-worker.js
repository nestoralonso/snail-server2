// interface MessageData {
//     id: number;
//     task: string;
//     data: any;
//   }

self.onmessage = function (evt) {
    const { id, task, data } = evt.data;
    console.log(`running task ${id} on thread`)
    console.log("🦊", { id, task, data });
    const func1 = '(function run' + task.slice('function'.length) + ")"
    self.postMessage({ id, result: eval(func1)(data) })
}