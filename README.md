To make it work on codesandbox, click "Open in a new Tab" in the minibrowser:

### Running on deno

This project does not run on nodejs because of the standard WebWorker that are used.
To run the test suite on deno type:
```bash
deno test --allow-read snail3.deno.test.js
```