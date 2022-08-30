//@ts-check
var buffer;

function getElement(fm, i, j) {
  const { data, cols } = fm;

  const ix = i * cols + j;
  return data[ix];
}

function copySegment({ mat, array, segment } = { mat: [], array: [] }) {
  console.log("🦊>>>> SANITY", { mat, ar: array}, JSON.stringify(segment))

  if (!segment || !segment.length) {
    console.log("Something went wrong");
    return -1;
  }
  let [dir, arI, ci, cj, minI, maxI, minJ, maxJ] = segment;
  console.log("🦊>>>> ~ copySegment ~ ", { dir, arI, ci, cj, minI, maxI, minJ, maxJ })


  const [di, dj] = dir;
  console.log("🦊>>>> ~ copySegment ~ { ar, mat }", { ar: array, mat })

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
  console.log("🦊", JSON.stringify(segment));
  if (command === "run") {
    console.log("Running w/", {mat, array, segment});
    const arI = copySegment({ mat, array, segment });
    self.postMessage({
      type: "result",
      arI,
    });
  }
};

