//@ts-check
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
// Following constants are vectors that indicate the direction of movement
/** @type {DirectionTuple} */
const RIGHT = [0, 1];

/** @type {DirectionTuple} */
const DOWN = [1, 0];

/** @type {DirectionTuple} */
const LEFT = [0, -1];

/** @type {DirectionTuple} */
const UP = [-1, 0];

/** @type {DirectionTuple} */
const NONE_DIR = [0x013, 0x013];

/** @type {MatrixSegment} */
// @ts-ignore
const NONE_SEGMENT = [NONE_DIR, -1, -1, -1, -1, -1, -1, -1, -1];

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
 * Traverses a matrix in a spiral pattern, returns the result as an array starting at 0, 0 clockwise direction
 *
 * @param {CompactMatrix} m the source matrix
 * @returns {MatrixSegment[]}
 */
export function snail(m) {
    if (!m || m.rows < 1 || m.cols < 1) {
        return [];
    }

    const length = m.rows * m.cols;
    let i = 0, j = 0;
    let maxJ = m.cols - 1, maxI = m.rows - 1;
    let minJ = 0, minI = 0;
    let curDir = RIGHT;

    let arI = 0;
    /** @type {MatrixSegment[]} */
    const resSegments = [];

    // initial segment length
    let segLength = m.cols;

    do {
        resSegments.push([curDir, arI, i, j, minI, maxI, minJ, maxJ, segLength]);
        arI += segLength;
        [curDir, arI, i, j, minI, maxI, minJ, maxJ, segLength] = nextSegment([curDir, arI, i, j, minI, maxI, minJ, maxJ, segLength]);
    } while (arI < length);

    return resSegments;
}


/**
 * @param {CompactMatrix} shabMatrix
 * @param {(errors: any, arrayResult: Int16Array) => void} callback
 */
function runSnailCb(shabMatrix, callback) {
    const length = shabMatrix.rows * shabMatrix.cols;

    const segments = snail(shabMatrix);
    console.log("🦊>>>> ~ runSnailCb ~ segments", segments.length)

    const shab = new SharedArrayBuffer(Int16Array.BYTES_PER_ELEMENT * length);
    const array = new Int16Array(shab);

    const pool = getWorkerPool();

    const numTasks = segments.length;
    let tasksCompleted = 0;
    const tasks = segments;

    for (const worker of pool) {
        worker.onmessage = function (/** @type {{ data: { type: string; }; }} */ msg) {
            const { type } = msg.data;
            switch (type) {
                case "result":
                    tasksCompleted++;
                    if (tasksCompleted === numTasks) {
                        console.timeEnd("snail-run");
                        callback(null, array);
                    } else {
                        if (tasks.length > 0) {
                            const segment = tasks.shift();
                            this.postMessage({
                                command: "run",
                                segment,
                                mat: shabMatrix,
                                array,
                            });
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }

    function run() {
        console.time("snail-run");
        for (const worker of pool) {
            const segment = tasks.shift();
            worker.postMessage({
                command: "run",
                mat: shabMatrix,
                array,
                segment,
            });
        }
    }

    run();
}

/**
 * @type {Function}
 */
export const asyncSnail = promisify(runSnailCb);

/**
 * @param {DirectionTuple} dir
 */
// @ts-ignore
function directionToString(dir) {
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
export function createRandMatrix(rows, cols) {
    let ix = 0;
    const byteLength = Int16Array.BYTES_PER_ELEMENT * rows * cols;
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

const NUM_WORKERS = 4;
/**
* @type {Worker[]}
*/
    const pool = [];

export function getWorkerPool() {
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

// init the worker pool before anything else
getWorkerPool();

/**
* @param {{ (shabMatrix: CompactMatrix, callback: (errors: any, arrayResult: Int16Array) => void): void; call?: any; }} fn
*/
function promisify(fn) {
    return (/** @type {CompactMatrix} */ shabMatrix) => {
        return new Promise((resolve, reject) => {
            /**
               * @param {any} err
               * @param {Int16Array} result
               */
            function customCallback(err, result) {
                if (err) {
                    return reject(err)
                }
                return resolve(result)
            }

            fn.call(null, shabMatrix, customCallback);
        })
    }
}

(async function testLolAsyncs() {
    console.log("Running snail test");
    let cMatrix = createCMatrix(mat4x3());
    let res = await asyncSnail(cMatrix);
    console.log(`Results [${cMatrix.rows}, ${cMatrix.cols}]`, res);

    cMatrix = createCMatrix(mat20x5());
    res = await asyncSnail(cMatrix);
    console.log(`Results [${cMatrix.rows}, ${cMatrix.cols}]`, res);
});

export function mat20x5() {

    const m = [
        [1, 2, 3, 4, 5],
        [46, 47, 48, 49, 6],
        [45, 84, 85, 50, 7],
        [44, 83, 86, 51, 8],
        [43, 82, 87, 52, 9],
        [42, 81, 88, 53, 10],
        [41, 80, 89, 54, 11],
        [40, 79, 90, 55, 12],
        [39, 78, 91, 56, 13],
        [38, 77, 92, 57, 14],
        [37, 76, 93, 58, 15],
        [36, 75, 94, 59, 16],
        [35, 74, 95, 60, 17],
        [34, 73, 96, 61, 18],
        [33, 72, 97, 62, 19],
        [32, 71, 98, 63, 20],
        [31, 70, 99, 64, 21],
        [30, 69, 100, 65, 22],
        [29, 68, 67, 66, 23],
        [28, 27, 26, 25, 24]
    ];

    return m;
}

export function mat4x3() {
    return [
        [1, 2, 3],
        [10, 11, 4],
        [9, 12, 5],
        [8, 7, 6]
    ];
}

