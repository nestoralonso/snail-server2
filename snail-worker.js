//@ts-check

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
*
* @param {any[]} segment
*
* @returns {number} the next index to be processed
*/
function copySegment(mat, array, segment) {

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


// @ts-ignore
self.onmessage = function (/** @type {{ data: { command: string; segment: any; mat: any; array: any; }; }} */ msg) {
  const { command, segment, mat, array } = msg.data;
  if (command === "run") {
    const arI = copySegment(mat, array, segment);
    // @ts-ignore
    self.postMessage({
      type: "result",
      arI,
    });
  }
};

