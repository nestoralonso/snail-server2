//@ts-check
/** @type {NodeListOf<HTMLButtonElement>} */
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

  mat[0] = 0;
  mat[length - 1] = 0x7FFF;

  const shab = new SharedArrayBuffer(Int16Array.BYTES_PER_ELEMENT * length);
  const array = new Int16Array(shab);


  const tasks = segments;
  let numTasks = 0;
  let tasksCompleted = 0;

  const pool = [];


  numTasks = tasks.length;

  function run() {
    console.time("snail-run");
    for (const worker of pool) {
      const segment = tasks.shift();
      worker.postMessage({
        command: "run",
        mat,
        array,
        segment,
      });
    }
  }

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
            alert(`Done. first=${array[0]}, last=${array[length]}`);
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
