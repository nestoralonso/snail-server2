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

    do {
        array[arI] = getElement(mat, ci, cj);
        ci += di;
        cj += dj;
        arI++;
    } while (ci >= minI && ci <= maxI && cj >= minJ && cj <= maxJ);

    return arI;
}