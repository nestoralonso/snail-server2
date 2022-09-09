To make it work on codesandbox, click "Open in a new Tab" in the minibrowser:

### To run in a Terminal requires deno
```bash
brew install deno
```
### Running the deno tests

This project does not run on nodejs because of the standard WebWorkers that are used.
To run the test suite on deno type:
```bash
deno test --allow-read src/snail3.deno.test.js
```

### Running standalone deno app

To run on a random matrix use:
```bash
deno run --allow-read src/main.ts --rows 65000 --cols 65000
```

To run with a specific test case:
```bash
deno run --allow-read src/main.ts --testInput fixtures/input-1000.json --testOutput fixtures/output-1000.json
```


### Strategy

the main tactic is decoupling the segments that have to be copied from the matrix, from the actual copy operation.
So there is a function in charge of generating the segments to be copied and another function that does copy to the resulting array.
For small arrays, the single threaded solution outperforms the threaded one, The copy operation can be made in parallel using Workers (that are Threads), to improve the performance in very large arrays, the workers don't
send any data back to the main thread, instead I use a SharedBuffer when all thread can write at the same time to the Same Shared Int16Array