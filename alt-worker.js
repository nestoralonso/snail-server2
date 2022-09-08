// interface MessageData {
//     id: number;
//     task: string;
//     data: any;
//   }

self.onmessage = function (evt) {
    const { id, task, data } = evt.data;
    console.log(`running task ${id} on thread`)
    const func1 = '(function run' + task.slice('function'.length) + ")"
    console.log("🦊", func1);
    self.postMessage({ id, result: eval(func1)(data) })
}