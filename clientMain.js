//@ts-check
import { asyncSnail, createCMatrix, createIntArray, createRandMatrix, equalIntArrays } from "./snail3.js";

/** @type {NodeListOf<HTMLButtonElement>} */
const buttons = document.querySelectorAll(".run-test");
buttons.forEach(b => b.addEventListener("click", runTest));

/** @type {HTMLElement} */
const resultsTextBlock = document.querySelector(".run-test-results") ?? document.body;

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

async function loadIntMatrixInputTestCase() {
  const inputReq  = await
    fetch("https://d3jrl7s14hrgo1.cloudfront.net/input-10000.json"),

  const inputJson = await inputReq.json();
  const input = createCMatrix(inputJson);
  return input;
}

async function loadIntArrayOutputTestCase() {
  const outputReq = await
    fetch("https://d3jrl7s14hrgo1.cloudfront.net/output-10000.json");
  const outputJson = await outputReq.json();
  const output = createIntArray(outputJson);
  return output;
}

function displayText(msg) {
  resultsTextBlock.innerHTML += msg + '<br>';
}

async function runBigTest(e) {
  displayText("Running...");

  let iniTime = Date.now();
  displayText(`Loading test cases...`);
  const input = await loadIntMatrixInputTestCase();
  let duration = Date.now() - iniTime;
  displayText(`Loaded test case in ${duration}`);

  iniTime = Date.now();
  const ans = await asyncSnail(input);
  duration = Date.now() - iniTime;
  displayText(`🥁🤑 Snail duration ${duration}`);

  iniTime = Date.now();
  const output = await loadIntArrayOutputTestCase();
  duration = Date.now() - iniTime;
  displayText(`🥁🤑 Loaded expected result in ${duration}`);

  const isEqual = equalIntArrays(ans, output);

  displayText(`🥁🤑 Results are ${isEqual}`);
}

console.log(window.report);
console.log(window.jestLite);
console.log(window.describe);