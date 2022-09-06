//@ts-check
// @ts-ignore deno does not know about importScripts
importScripts('./snail-utils.js')

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


// @ts-ignore
self.onmessage = function (/** @type {{ data: { command: string; segment: any; mat: any; array: any; }; }} */ msg) {
  const { command, segment, mat, array } = msg.data;
  if (command === "run") {

    // @ts-ignore deno does not recognize that this function is imported from snail-utils
    const arI = copySegment(mat, array, segment);
    // @ts-ignore
    self.postMessage({
      type: "result",
      arI,
    });
  }
};

