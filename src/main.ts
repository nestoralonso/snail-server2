import { parse } from "https://deno.land/std@0.154.0/flags/mod.ts";

import { asyncSnail, workersSnail, classicSnail, createCMatrix, createIntArray, createRandCMatrix, equalIntArrays } from "./snail3.js";

const USAGE = `
Usage:
# RUNS WITH RAND MATRIX
snail --rows 10 --cols 10

# RUNS WITH A TEST CASE
snail --testInput fixtures/input-1000.json --testOutput=fixtures/output-1000.json

# RUNS WITH THE CLASSIC SYNC ALGORITHM
snail --algorithm=classic --rows 10 --cols 10
`;

const parsedArgs = parse(Deno.args, {
    default: {"algorithm": "auto"}
});
let { rows, cols, testInput, testOutput, algorithm } = parsedArgs;
console.log("🦊>>>> ~ parsedArgs", parsedArgs)
const fileMode = Boolean(testInput && testOutput);
const randMode = Boolean(rows && cols);

if (!fileMode && !randMode) {
    console.log("🧁LOL1");
    console.log(USAGE);
    Deno.exit(1);
}

let mat = null;
if (rows && cols) {
    rows = parseInt(rows);
    cols = parseInt(cols);
    console.log("🦊>>>> ~ { rows, cols }", { rows, cols })

    console.time("create-rand-matrix");
    mat = createRandCMatrix(rows, cols);
    console.timeEnd("create-rand-matrix");
}

if (testInput && testOutput) {
    const jsMat = JSON.parse(Deno.readTextFileSync(testInput));
    mat = createCMatrix(jsMat);
}


if (!mat) {
    console.log(USAGE);
    Deno.exit(1);
}

console.time("snail-sort");

let func = asyncSnail;
if (algorithm === 'classic') {
    func = classicSnail;
} else if (algorithm === 'workers') {
    //@ts-ignore
    func = workersSnail;
}
const arr = await func(mat);
console.timeEnd("snail-sort");
console.log("💸💲💸 array length ", arr.length);
console.log("💸💲💸 first 10 elements", arr.slice(0, 10));

if (fileMode) {
    const jsOut = JSON.parse(Deno.readTextFileSync(testOutput));
    const testOut = createIntArray(jsOut);
    const isEqual = equalIntArrays(arr, testOut);

    const icon = isEqual ? "✅ 😎🥁💯💰" : "❌ 🤦‍♀️🤷‍♂️💀😿";
    console.log(`${icon}: current and expected are equal? `, isEqual);
}
Deno.exit(0);