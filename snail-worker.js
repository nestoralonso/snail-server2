//@ts-check
var buffer;

function getm(fm, i, j) {
  const { data, cols } = fm;

  const ix = i * cols + j;
  return data[ix];
}

function copySegment({ mat, ar, segment } = { mat: [], ar: [], segment: [] }) {
  if (!segment || !segment.length || !mat || !mat.length || !ar || !ar.length) {
    console.log("Something went wrong");
    return -1;
  }
  let [dir, arI, ci, cj, minI, maxI, minJ, maxJ] = segment;
  console.log("🦊>>>> ~ copySegment ~ ", { dir, arI, ci, cj, minI, maxI, minJ, maxJ })


  const [di, dj] = dir;
  console.log("🦊>>>> ~ copySegment ~ { ar, mat }", { ar, mat })

  do {
    ar[arI] = getm(mat, ci, cj);
    ci += di;
    cj += dj;
    arI++;
  } while (ci >= minI && ci <= maxI && cj >= minJ && cj <= maxJ);

  return arI;
}


self.onmessage = function (msg) {
  const { command, segment, mat, res } = msg.data;
  console.log("🦊", JSON.stringify(segment));
  if (command === "run") {
    console.log("Running w/", mat, res);
    const arI = copySegment({ mat, ar: res, segment });
    self.postMessage({
      type: "result",
      arI,
    });
  }
};

