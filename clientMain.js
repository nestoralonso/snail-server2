//@ts-check
/** @type {NodeListOf<HTMLButtonElement>} */
const buttons = document.querySelectorAll(".run-test");
buttons.forEach(b => b.addEventListener("click", runTest));

/**
 * {Event} e
*/
async function runTest(e) {
  const { rows, cols } = e.target.dataset;
  buttons.forEach(b => {
     b.disabled = true;
  });

  const NUM_WORKERS = 4;

  // let mat = createRandMatrix(parseInt(rows), parseInt(cols));
  console.log(`🦊 ${JSON.stringify(mat4x3(), null, 4)}`)
  let mat = createCMatrix(mat4x3());

  let res = await asyncSnail(mat);
  console.log("🤑 res", res.length)
}