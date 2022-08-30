//@ts-check
const button = document.querySelector("button");
button?.addEventListener("click", runTest);

function runTest() {
  const NUM_WORKERS = 4;

  let mat = createMatrix([
    [0, 1, 2],
    [7, 8, 3],
    [6, 5, 4],
  ]);
  let segments = snail(mat);

  const length = mat.rows * mat.cols;
  const shab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * length);
  const ar = new Int32Array(shab);

  console.log({ mat, ar });

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
      const segment = tasks.shift();
      pool[i].postMessage({
        command: "run",
        mat,
        ar,
        segment,
      });
    }
  }

  //worker pool
  console.time("pool-init");
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = new Worker("snail-worker.js");
    pool.push(worker);
    worker.onmessage = function (msg) {
      const { type, arI} = msg.data;
      switch (type) {
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
              console.log("👍🏽", {arI});
              const segment = tasks.shift();
              this.postMessage({
                command: "run",
                segment,
                mat,
                ar,
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
