//@ts-check
import { asyncSnail, classicSnail, createCMatrix, createIntArray, createRandCMatrix, equalIntArrays, workersSnail } from "./snail3.js";

/** @type {NodeListOf<HTMLButtonElement>} */
const caseButtons = document.querySelectorAll(".run-test");
caseButtons.forEach(b => b.addEventListener("click", runTest));

/** @type {HTMLElement} */
const resultsTextBlock = document.querySelector(".run-test-results") ?? document.body;


let snailFunc = asyncSnail;
const params = new URLSearchParams(window.location.search);
const algorithm = params.algorithm;
if (algorithm === 'classic') {
    snailFunc = classicSnail;
} else if (algorithm === 'workers') {
    //@ts-ignore
    snailFunc = workersSnail;
}

/**
 * @param {Event} e
*/
async function runTest(e) {
  clearText();
  const { rows, cols } = e.target.dataset;
  toggleTestButtons(false);

  let iniTime, duration;
  displayText(`Creating rand matrix...`);
  iniTime = Date.now();
  let mat = createRandCMatrix(parseInt(rows), parseInt(cols));
  duration = Date.now() - iniTime;
  displayText(`rand matrix computed in ${duration} ms`);

  displayText(`Computing snail sort...`);
  iniTime = Date.now();
  let res = await snailFunc(mat);
  duration = Date.now() - iniTime;
  displayText(`snail sort computed in ${duration} ms`);

  toggleTestButtons(true);
  console.log("🤑 res", res.length)
}


/** @type {NodeListOf<HTMLButtonElement>} */
const bigTestButton = document.querySelectorAll(".run-big-test");
bigTestButton.forEach(b => b.addEventListener("click", runBigTest));

/**
* @param {number} size
*/
async function loadIntMatrixInputTestCase(size) {
  const inputReq = await
    fetch(`https://d3jrl7s14hrgo1.cloudfront.net/input-${size}.json`);

  const inputJson = await inputReq.json();
  const input = createCMatrix(inputJson);
  return input;
}

/**
* @param {number} size
*/
async function loadIntArrayOutputTestCase(size) {
  const outputReq = await
    fetch(`https://d3jrl7s14hrgo1.cloudfront.net/output-${size}.json`);
  const outputJson = await outputReq.json();
  const output = createIntArray(outputJson);
  return output;
}

/**
* @param {string} msg
*/
function displayText(msg) {
  resultsTextBlock.innerHTML += '🦊 ' + msg + '<br/>';
}

function clearText() {
  resultsTextBlock.innerHTML = '';
}

/**
* @param {boolean} enabled
*/
function toggleTestButtons(enabled) {
  /** @type {NodeListOf<HTMLButtonElement>} */
  const buttons = document.querySelectorAll('.custom-tests-area button');
  buttons.forEach(b => b.disabled = !enabled);
}

async function runBigTest(e) {
  clearText();
  toggleTestButtons(false);
  const { rows } = e.target.dataset;

  displayText(`Running... ${rows} test`);

  let iniTime = Date.now();
  displayText(`Loading input for test case...`);
  const input = await loadIntMatrixInputTestCase(rows);
  let duration = Date.now() - iniTime;
  displayText(`Loaded test case in ${duration} ms`);

  displayText(`Computing spiral sort...`);
  iniTime = Date.now();
  const ans = await snailFunc(input);
  duration = Date.now() - iniTime;
  displayText(`🥁🤑 Snail duration ${duration} ms`);

  displayText(`Loading output for test case...`);
  iniTime = Date.now();
  const output = await loadIntArrayOutputTestCase(rows);
  duration = Date.now() - iniTime;
  displayText(`🥁🤑 Loading output for test case took ${duration} ms`);

  const isEqual = equalIntArrays(ans, output);

  displayText(`🥁🤑 Results match?: ${isEqual}`);
  toggleTestButtons(true);
}

console.log(window.report);
console.log(window.jestLite);
console.log(window.describe);