//@ts-check
var buffer;

function getm(fm, i, j) {
  const { data, cols } = fm;

  const ix = i * cols + j;
  return data[ix];
}

function copySegment([dir, arI, ci, cj, minI, maxI, minJ, maxJ]) {
  // console.log("🦊>>>> ~ copySegment ~ ", {dir, arI, ci, cj, minI, maxI, minJ, maxJ})
  const [di, dj] = dir;
  const { ar, mat } = Piscina.workerData;
  // console.log("🦊>>>> ~ copySegment ~ { ar, mat }", { ar, mat })

  do {
      ar[arI] = getm(mat, ci, cj);
      ci += di;
      cj += dj;
      arI++;
  } while (ci >= minI && ci <= maxI && cj >= minJ && cj <= maxJ);

  return arI;
}


self.onmessage = function (msg) {
  console.log(JSON.stringify(msg));
  const { command, segment } = msg.data;
  console.log("🦊", JSON.stringify(segment));
  if (command === "run") {
    console.log("Run");
    self.postMessage({
      type: "result",
    });
  }
};

