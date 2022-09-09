//@ts-check
import { cases } from "../fixtures/cases.js";
import { asyncSnail, equalIntArrays } from "./snail3.js";

const {
    core: { describe, it, expect, run },
    prettify
} = window.jestLite;

describe("Snail Sort", () => {
    cases
        .filter((c) => c.enabled)
        .forEach((c) =>
            it(c.name, async () => {

                const matrix = c.input();
                const curr = await asyncSnail(matrix);

                if (!c.noCheck) {
                    const output = c.output();
                    console.log("👀", curr);
                    console.log("🤑", output);
                    const isEqual = equalIntArrays(curr, output);
                    expect(isEqual).toEqual(true);
                } else {
                    expect(1).toBe(1);
                }
            })
        );
});

const reportEl = document.querySelector("#report");
prettify.toHTML(run(), reportEl);