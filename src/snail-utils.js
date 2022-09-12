//@ts-check
/** @typedef {[number, number]} Delta */
/** @typedef {number} DirectionTuple */

// Following constants are vectors that indicate the direction of movement
/** @type {Delta} */
export const DELTA_RIGHT = [0, 1];

/** @type {Delta} */
export const DELTA_DOWN = [1, 0];

/** @type {Delta} */
export const DELTA_LEFT = [0, -1];

/** @type {Delta} */
export const DELTA_UP = [-1, 0];

/** @type {Delta} */
export const DELTA_NONE = [-0x013, -0x013];

export const RIGHT = 0;
export const DOWN = 1;
export const LEFT = 2;
export const UP = 3;
export const NONE_DIR = -1;

const DeltaMap = new Map([
    [RIGHT, DELTA_RIGHT],
    [DOWN, DELTA_DOWN],
    [LEFT, DELTA_LEFT],
    [UP, DELTA_UP],
]);

/**
* @param {DirectionTuple} dir
*/
function getDelta(dir) {
    return DeltaMap.get(dir) ?? DELTA_NONE;
}

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

/**
 *
 * @param {CompactMatrix} cMatrix target matrix
 * @param {number} i
 * @param {number} j
 * @returns
 */
function getElement(cMatrix, i, j) {
    const { data, cols } = cMatrix;

    const ix = i * cols + j;
    return data[ix];
}

/**
* @param {CompactMatrix} mat
* @param {Int16Array} array
* @param {MatrixSegment} segment
*
* @returns {number} the next index to be processed
*/
export function copySegment(mat, array, segment) {
    if (!segment || !segment.length) {
        return -1;
    }

    let [dir, arI, ci, cj, minI, maxI, minJ, maxJ] = segment;
    const [di, dj] = getDelta(dir);

    if (dir === RIGHT) {
        do {
            array[arI] = getElement(mat, ci, cj);
            cj += dj;
            arI++;
        } while (cj <= maxJ);
    } else if (dir === DOWN) {
        do {
            array[arI] = getElement(mat, ci, cj);
            ci += di;
            arI++;
        } while (ci <= maxI);
    } else if (dir === LEFT) {
        do {
            array[arI] = getElement(mat, ci, cj);
            cj += dj;
            arI++;
        } while (cj >= minJ);
    } else if (dir === UP) {
        do {
            array[arI] = getElement(mat, ci, cj);
            ci += di;
            arI++;
        } while (ci >= minI);
    } else {
        throw new Error(`Unknown direction ${dir}`);
    }
    return arI;
}