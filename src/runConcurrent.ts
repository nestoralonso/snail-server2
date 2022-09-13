import {
  createCMatrix,
  snailSegments,
  workersSnail,
} from "./snail3.js";


console.log("😎");
console.time('read-input');
// const cMat = createCMatrix(
//   JSON.parse(Deno.readTextFileSync("./fixtures/input-1000.json")),
// );
const cMat1 = createCMatrix([
    [1,2,3],
    [8,9,4],
    [7,6,5],
]);

// const cMat1 = createRandCMatrix(100, 100);

const segs = snailSegments(cMat1);
for(const s of segs) {
    console.log("👽", JSON.stringify(s));
}
const cMat2 = createCMatrix([
    [ 1,  2,  3,  4, 5],
    [16, 17, 18, 19, 6],
    [15, 24, 25, 20, 7],
    [14, 23, 22, 21, 8],
    [13, 12, 11, 10, 9]
]);

const cMat3 = createCMatrix([
    [1, 2, 3],
    [10, 11, 4],
    [9, 12, 5],
    [8, 7, 6]
])
console.timeEnd('read-input');

// console.time("read-expected-output");
// const expectedOutput = createIntArray(
//   JSON.parse(Deno.readTextFileSync("./fixtures/10_000/output-10000.json")),
// );
// console.log("🦊>>>> ~ cMat", { cMat, expectedOutput });
// console.timeEnd("read-expected-output");

console.time("snail-run");
const resps = await Promise.all([
    workersSnail(cMat1),
    workersSnail(cMat2),
    workersSnail(cMat3),
]);
console.timeEnd("snail-run");
console.log({ resps });
Deno.exit(0);