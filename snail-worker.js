//@ts-check
function getElement(cMatrix, i, j) {
  const { data, cols } = cMatrix;

  const ix = i * cols + j;
  return data[ix];
}

function copySegment({ mat, array, segment } ) {

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


self.onmessage = function (msg) {
  const { command, segment, mat, array } = msg.data;
  if (command === "run") {
    const arI = copySegment({ mat, array, segment });
    self.postMessage({
      type: "result",
      arI,
    });
  }
};

