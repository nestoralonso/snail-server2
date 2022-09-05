//@ts-check
import { cases } from "./fixtures/cases.js";
import { asyncSnail } from "./snail3.js";

function equalIntArray(ab1, ab2) {
    if (ab1.length !== ab2.length) return false;
    for (let i = 0; i < ab1.length; i++) {
        if (ab1[i] !== ab2[i]) return false;
    }

    return true;
}

const {
    core: { describe, it, expect, run },
    prettify
} = window.jestLite;

describe("Snail Sort", () => {
    // jest.setTimeout(180000);
    cases
        .filter((c) => c.enabled)
        .forEach((c) =>
            it(c.name, async () => {

                const matrix = c.input();
                const curr = await asyncSnail(matrix);

                if (!c.noCheck) {
                    console.log("👀", curr);
                    console.log("🤑", c.output);
                    const isEqual = equalIntArray(curr, c.output);
                    expect(isEqual).toEqual(true);
                } else {
                    expect(1).toBe(1);
                }
            })
        );
});

const reportEl = document.querySelector("#report");
prettify.toHTML(run(), reportEl);