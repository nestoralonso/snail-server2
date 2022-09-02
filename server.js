const http = require("http");
const static_ = require("node-static");

const file = new static_.Server(__dirname, {
  headers: {
    // headers to enable SharedArrayBuffer
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp"
  }
});
console.log("🐮 Ehlo");

http
  .createServer(function (req, res) {
    file.serve(req, res);
  })
  .listen(8080);
