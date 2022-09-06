To make it work on codesandbox, click "Open in a new Tab" in the minibrowser:

### Running on deno

This project does not run on nodejs because of the standard WebWorker that are used.
To run the test suite on deno type:
```bash
deno test --allow-read snail3.deno.test.js
```

### Strategy

the main strategy in play here, is decoupling the segments to copy from the matrix, from the actual copy operation.
So there is a function in charge of generating the segments to be copied and another function that does the actual copying.
The copy operation can be made in parallel using Workers (that are Threads), to improve the performance in very large arrays, the workers don't
send any data back to the main thread, instead I use a SharedBuffer when all thread can write at the same time to the Same Shared Int16Array