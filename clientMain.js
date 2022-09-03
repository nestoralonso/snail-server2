//@ts-check
import { asyncSnail, createCMatrix, createIntArray, createRandMatrix, equalIntArrays } from "./snail3.js";

/** @type {NodeListOf<HTMLButtonElement>} */
const buttons = document.querySelectorAll(".run-test");
buttons.forEach(b => b.addEventListener("click", runTest));

const resultsTextBlock = document.querySelectorAll(".run-test-results");

/**
 * {Event} e
*/
async function runTest(e) {
  const { rows, cols } = e.target.dataset;
  buttons.forEach(b => {
    b.disabled = true;
  });

  let mat = createRandMatrix(parseInt(rows), parseInt(cols));
  console.log("🦊>>>> ~ running with matrix ", mat)
  // console.log(`🦊 ${JSON.stringify(mat4x3(), null, 4)}`)
  // let mat = createCMatrix(mat4x3());

  let res = await asyncSnail(mat);
  buttons.forEach(b => {
    b.disabled = false;
  });
  console.log("🤑 res", res.length)
}


/** @type {NodeListOf<HTMLButtonElement>} */
const bigTestButton = document.querySelectorAll(".run-big-test");
bigTestButton.forEach(b => b.addEventListener("click", runBigTest));

async function loadIntArrayTestCase() {
  const [inputReq, outputReq] = await Promise.all([
    fetch("https://d3jrl7s14hrgo1.cloudfront.net/input-10000.json"),
    fetch("https://d3jrl7s14hrgo1.cloudfront.net/output-10000.json"),
  ]);
  const inputJson = await inputReq.json();
  const outputJson = await outputReq.json();

  const input = createCMatrix(inputJson);
  const output = createIntArray(outputJson);
  return { input, output };
}

async function runBigTest(e) {
  resultsTextBlock.forEach(e => e.textContent = "Running...\n");

  let iniTime = Date.now();
  resultsTextBlock.forEach(e => e.textContent += `Loading test cases...`);
  const { input, output } = await loadIntArrayTestCase();
  let duration = Date.now() - iniTime;
  resultsTextBlock.forEach(e => e.textContent += `Loaded test case in ${duration}`);

  iniTime = Date.now();
  const ans = await asyncSnail(input);
  duration = Date.now() - iniTime;
  const isEqual = equalIntArrays(ans, output);
  console.log(`🥁🎉 And the result is `, {isEqual});

  resultsTextBlock.forEach(e => e.textContent += `🥁🤑 Snail duration ${duration}`);
  resultsTextBlock.forEach(e => e.textContent += `🥁🤑 Results are ${isEqual}`);
}

console.log(window.report);
console.log(window.jestLite);
console.log(window.describe);