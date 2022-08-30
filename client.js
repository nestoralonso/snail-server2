//@ts-check
const button = document.querySelector("button");
button?.addEventListener("click", runTest);

function runTest() {
  const NUM_WORKERS = 4;

  let mat = createRandMatrix(2, 2);
  let segments = snail(mat);

  const length = mat.rows * mat.cols;
  const shab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * length);
  const res = new Int32Array(shab);

  console.log({ mat, res });

  const tasks = segments;
  let numTasks = 0;
  let tasksCompleted = 0;

  const pool = [];
  performance.mark("testStart");
  numTasks = tasks.length;
  console.log("🦊>>>> ~ runTest ~ numTasks", numTasks)

  function run() {
    console.time("snail-run");
    for (let i = 0; i < NUM_WORKERS; i++) {
      const task = tasks.shift();
      pool[i].postMessage({
        command: "run",
        segment: task,
        mat,
        res,
      });
    }
  }

  //worker pool
  console.time("pool-init");
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = new Worker("snail-worker.js");
    pool.push(worker);
    worker.onmessage = function (msg) {
      switch (msg.data.type) {
        case "result":
          tasksCompleted++;
          if (tasksCompleted === numTasks) {
            console.log("🤑💯 ", res);
            console.timeEnd("snail-run");
            performance.mark("testEnd");
            performance.measure("runTest", "testStart", "testEnd");
            const timeTaken = performance.getEntriesByName("runTest")[0].duration;
            alert(`Done. in ${timeTaken} ms`);
          } else {
            if (tasks.length > 0) {
              const task = tasks.shift();
              this.postMessage({
                command: "run",
                segment: task
              });
            }
          }
          break;
        default:
          break;
      }
    };
  }

  run();
}
