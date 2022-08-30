//@ts-check
const buttons = document.querySelectorAll(".run-test");
buttons.forEach(b => b.addEventListener("click", runTest));

/**
 * {Event} e
*/
function runTest(e) {
  const { rows, cols } = e.target.dataset;
  buttons.forEach(b => {
     b.disabled = true;
  });

  const NUM_WORKERS = 4;

  let mat = createRandMatrix(parseInt(rows), parseInt(cols));
  let segments = snail(mat);
  console.log("🤑 segments", segments.length)

  const length = mat.rows * mat.cols;
  const shab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * length);
  const array = new Int32Array(shab);


  const tasks = segments;
  let numTasks = 0;
  let tasksCompleted = 0;

  const pool = [];
  performance.mark("testStart");
  numTasks = tasks.length;

  function run() {
    console.time("snail-run");
    for (let i = 0; i < NUM_WORKERS; i++) {
      const segment = tasks.shift();
      pool[i].postMessage({
        command: "run",
        mat,
        array,
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
      const { type, arI } = msg.data;
      switch (type) {
        case "result":
          tasksCompleted++;
          if (tasksCompleted === numTasks) {
            buttons.forEach(b => {
              b.disabled = false;
           });
            console.timeEnd("snail-run");
            performance.mark("testEnd");
            performance.measure("runTest", "testStart", "testEnd");
            const timeTaken = performance.getEntriesByName("runTest")[0].duration;
            alert(`Done. in ${timeTaken} ms`);
          } else {
            if (tasks.length > 0) {
              const segment = tasks.shift();
              this.postMessage({
                command: "run",
                segment,
                mat,
                array,
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
