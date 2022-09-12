//@ts-check
import { copySegment, DOWN, LEFT, NONE_DIR, RIGHT, UP } from "./snail-utils.js";

/** @typedef {[number, number]} DirectionTuple */

/**
 * A matrix represented as a SharedArrayBuffer
 * An ArrayBuffer cannot be nested
 * So the matrix will be represented as an m*n array
 *
 * @typedef {Object} CompactMatrix
 * @property {Int16Array} data this will contain the matrix rows side by side
 * @property {number} rows number of rows
 * @property {number} cols number of cols
 *
*/

/**
 * MatrixSegment an subsegment of a row or column of a matrix
 * to be copied to the destination array
 *
 * @typedef {number} DestArrayIndex current index in the destination array
 * @typedef {number} CurrI the current i position in the matrix
 * @typedef {number} CurrJ the current j position in the matrix
 * @typedef {number} MinI the minimum i coordinate
 * @typedef {number} MaxI the maximum i coordinate
 * @typedef {number} MinJ the minimum j coordinate
 * @typedef {number} MaxJ the maximum j coordinate
 * @typedef {number} SegmentLength segment length
 *
 * @typedef {[DirectionTuple, DestArrayIndex, CurrI, CurrJ, MinI, MaxI, MinJ, MaxJ, SegmentLength]} MatrixSegment
*/


/** @type {MatrixSegment} */
// @ts-ignore
export const NONE_SEGMENT = [NONE_DIR, -1, -1, -1, -1, -1, -1, -1, -1];

// key: current direction, value: next direction
const NextDirectionMap = new Map([
    [RIGHT, DOWN],
    [DOWN, LEFT],
    [LEFT, UP],
    [UP, RIGHT],
]);

// just to print direction name for debugging
const DirectionName = new Map([
    [RIGHT, "Right"],
    [DOWN, "Down"],
    [LEFT, "Left"],
    [UP, "Up"],
]);

/**
 * Traverses a matrix in a spiral pattern, returns the result as a generator starting at 0, 0 clockwise direction
 *
 * @param {CompactMatrix} m the source matrix
 * @returns {Generator<MatrixSegment>}
 */
export function* snailSegments(m) {
    if (!m || m.rows < 1 || m.cols < 1) {
        return [];
    }

    const length = m.rows * m.cols;
    let i = 0, j = 0;
    let maxJ = m.cols - 1, maxI = m.rows - 1;
    let minJ = 0, minI = 0;
    let curDir = RIGHT;

    let arI = 0;

    // initial segment length
    let segLength = m.cols;
    let cnt = 0;
    do {
        yield [curDir, arI, i, j, minI, maxI, minJ, maxJ, segLength];

        arI += segLength;
        [curDir, arI, i, j, minI, maxI, minJ, maxJ, segLength] = nextSegment([curDir, arI, i, j, minI, maxI, minJ, maxJ, segLength]);
        cnt++;
    } while (arI < length);

    return cnt;
}


/**
 * @param {CompactMatrix} shabMatrix
 * @param {(errors: any, arrayResult: Int16Array) => void} callback
 */
function runSnailCb(shabMatrix, callback) {

    const length = shabMatrix.rows * shabMatrix.cols;

    const segments = snailSegments(shabMatrix);
    const shab = new SharedArrayBuffer(Int16Array.BYTES_PER_ELEMENT * length);
    const array = new Int16Array(shab);

    const pool = initWorkerPool();

    let tasksCompleted = 0;
    const tasks = segments;
    const numTasks = numSegments(shabMatrix.rows, shabMatrix.cols);

    for (const worker of pool) {
        worker.onmessage = function (/** @type {{ data: { type: string; }; }} */ msg) {
            const { type } = msg.data;
            switch (type) {
                case "result": {
                    tasksCompleted++;
                    const { value: task } = tasks.next();

                    if (tasksCompleted === numTasks) {
                        callback(null, array);
                    } else if (tasksCompleted < numTasks) {
                        this.postMessage({
                            command: "run",
                            segment: task,
                            mat: shabMatrix,
                            array,
                        });
                    }
                    break;
                }
                default:
                    break;
            }

        }
    }

    function run() {
        const numStartWorkers = numTasks < NUM_WORKERS ? numTasks : NUM_WORKERS;
        for (let i = 0; i < numStartWorkers; i++) {
            const worker = pool[i];
            const next = segments.next();
            const task = next.value;

            const segment = task;
            worker.postMessage({
                command: "run",
                mat: shabMatrix,
                array,
                segment,
            });

            i++;
        }
    }

    run();
}

/**
 * @param {CompactMatrix} matrix
 *
 */
export async function workersSnail(matrix) {
    const res = await new Promise((resolve => {
        runSnailCb(matrix, (errs, result) => {
            resolve(result);
        })
    }));

    console.log(`res length ${res.length}`);
    return res;
};

/**
* @param {CompactMatrix} matrix
*/
export async function asyncSnail(matrix) {
    const length = matrix.rows * matrix.cols;
    if (length < 1) {
        // use old sequential code, faster for small matrices
        return classicSnail(matrix);
    }

    const result = await workersSnail(matrix);
    return result;
}

/**
* @param {CompactMatrix} matrix
*/
export async function classicSnail(matrix) {
    const length = matrix.rows * matrix.cols;
    const shab = new SharedArrayBuffer(Int16Array.BYTES_PER_ELEMENT * length);
    const array = new Int16Array(shab);

    const segments = snailSegments(matrix);
    for (const s of segments) {
        copySegment(matrix, array, s);
    }

    return await Promise.resolve(array);
}

/**
 * @param {DirectionTuple} dir
 */
// @ts-ignore
export function directionToString(dir) {
    return DirectionName.get(dir);
}

/**
 * @param {DirectionTuple} currDir
 */
function nextDirection(currDir) {
    const res = NextDirectionMap.get(currDir) ?? NONE_DIR;

    return res;
}
/**
 *
 * @param {MatrixSegment} segment

 * @returns {MatrixSegment}
 */
function nextSegment([dir, arI, ci, cj, minI, maxI, minJ, maxJ, _length]) {
    const nextDir = nextDirection(dir);
    let length = 0;
    if (nextDir === DOWN) {
        cj = maxJ;
        minI++;
        ci++;
        length = maxI - ci + 1;
    } else if (nextDir === LEFT) {
        ci = maxI;
        maxJ--;
        cj--;
        length = cj - minJ + 1;
    } else if (nextDir === UP) {
        cj = minJ;
        maxI--;
        ci--;
        length = ci - minI + 1;
    } else if (nextDir === RIGHT) {
        ci = minI;
        minJ++;
        cj++;
        length = maxJ - cj + 1;
    }

    return [nextDir, arI, ci, cj, minI, maxI, minJ, maxJ, length];
}


/**
* Estimates the number of segment that will be generated

* @param {number} rows
* @param {number} cols
*/
function numSegments(rows, cols) {
    if (rows > cols) {
        const min = Math.min(rows, cols) * 2;

        return min;
    }

    return Math.min(rows, cols) * 2 - 1;
}

/**
 * @param {number[][]} jsMatrix
 *
 * @returns {CompactMatrix} a matrix encoded into an IntArray
 */
export function createCMatrix(jsMatrix) {
    let ix = 0;
    const rows = jsMatrix.length;
    const cols = jsMatrix?.[0]?.length ?? 0;
    const sharedArrayBuffer = new SharedArrayBuffer(Int16Array.BYTES_PER_ELEMENT * (rows * cols));
    const mInt32 = new Int16Array(sharedArrayBuffer);

    for (let i = 0; i < jsMatrix.length; i++) {
        const row = jsMatrix[i];
        for (let j = 0; j < row.length; j++) {
            mInt32[ix] = row[j];
            ix++;
        }
    }

    return {
        data: mInt32,
        rows,
        cols,
    };
}

/**
 * @param {number} rows
 * @param {number} cols
 *
 * @returns {CompactMatrix} a matrix encoded as a unidimnesional array
 */
export function createRandCMatrix(rows, cols) {
    let ix = 0;
    const length = rows * cols;
    const byteLength = Int16Array.BYTES_PER_ELEMENT * length;
    const sharedArrayBuffer = new SharedArrayBuffer(byteLength);
    const data = new Int16Array(sharedArrayBuffer);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            data[ix] = Math.floor(Math.random() * 1000);
            ix++;
        }
    }

    return {
        data,
        rows,
        cols,
    };
}

/**
 * Creates an IntArray from an old regular js array
 *
 * @param {number[]} jsArray
 *
 * @returns {Int16Array} a compact array
 */
export function createIntArray(jsArray) {
    const sharedArrayBuffer = new SharedArrayBuffer(Int16Array.BYTES_PER_ELEMENT * jsArray.length);
    const arInt32 = new Int16Array(sharedArrayBuffer);

    for (let i = 0; i < jsArray.length; i++) {
        arInt32[i] = jsArray[i];
    }

    return arInt32;
}

/**
 * check if two IntArrays are equal
 * @param {Int16Array} ab1
 * @param {Int16Array} ab2
 */
export function equalIntArrays(ab1, ab2) {
    if (ab1.length !== ab2.length) return false;
    for (let i = 0; i < ab1.length; i++) {
        if (ab1[i] !== ab2[i]) return false;
    }

    return true;
}

const NUM_WORKERS = 16;
/**
* @type {Worker[]}
*/
const pool = [];

export function initWorkerPool() {
    if (pool.length > 0) return pool;

    for (let i = 0; i < NUM_WORKERS; i++) {
        // classic worker
        // const worker = new Worker("snail-worker.js");

        // module worker (required by deno)
        const worker = new Worker(new URL("./snail-worker.js", import.meta.url).href, { type: "module" });
        pool.push(worker);
    }

    return pool;
}


/**
* @param {number} delay
*/
function sleep(delay) {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}