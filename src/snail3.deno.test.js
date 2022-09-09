//@ts-check
import { cases } from "../fixtures/cases.js";
import { asyncSnail, initWorkerPool } from "./snail3.js";
import { assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";


/**
* @param {Int16Array} ab1
* @param {Int16Array} ab2
*/
function equalIntArray(ab1, ab2) {
    if (ab1.length !== ab2.length) return false;
    for (let i = 0; i < ab1.length; i++) {
        if (ab1[i] !== ab2[i]) return false;
    }

    return true;
}

cases
    .filter((c) => c.enabled)
    .forEach((c) =>
        Deno.test(c.name, async () => {

            const matrix = c.input();
            const curr = await asyncSnail(matrix);

            if (!c.noCheck) {
                const output = c.output();
                const isEqual = equalIntArray(curr, output);
                console.log("👀", curr);
                console.log("🤑", output);

                assertEquals(isEqual, true);
            } else {
                assertEquals(1, 1);
            }
        })
    );
