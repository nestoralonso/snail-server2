//@ts-check

import { DOWN, LEFT, RIGHT, UP } from "./snail3.js";

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
    const [di, dj] = dir;

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
            ci += di;
            cj += dj;
            arI++;
        } while (cj >= minJ);
    } else if (dir === UP) {
        do {
            array[arI] = getElement(mat, ci, cj);
            ci += di;
            arI++;
        } while (ci >= minI);
    }
    return arI;
}