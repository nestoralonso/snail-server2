//worker
var buffer;
self.onmessage = function (msg) {
  console.log(msg);
  if (msg.data.command === "run") {
    console.log("Run");
    self.postMessage({
      type: "result",
    });
  }
};

