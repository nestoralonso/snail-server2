function timedFunc(func) {
    return function fun(...args) {
        const iniTime = new Date().getTime();
        const res = func(...args);
        const endTime = new Date().getTime();
        const totalTime = endTime - iniTime;
        console.log(`🦊 ${func.name} (${args.length}) ~ totalTime`, (totalTime / 1000));

        return res;
    }
}

const cases = [
    {
        name: "3x3 Matrix",
        input: () => createCMatrix([
            [1, 2, 3],
            [8, 9, 4],
            [7, 6, 5]
        ]),
        output: createArray([1, 2, 3, 4, 5, 6, 7, 8, 9]),
        enabled: true
    },
    {
        name: "4x4 Matrix",
        input: () => createCMatrix([
            [1, 2, 3, 4],
            [12, 13, 14, 5],
            [11, 16, 15, 6],
            [10, 9, 8, 7]
        ]),
        output: createArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
        enabled: true,
    },
    {
        name: "5x5 Matrix",
        input: () => createCMatrix([
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20],
            [21, 22, 23, 24, 25]
        ]),
        output: createArray([1, 2, 3, 4, 5, 10, 15, 20, 25, 24, 23, 22, 21, 16, 11, 6, 7, 8, 9, 14, 19, 18, 17, 12, 13]),
        enabled: true,
    },
    {
        name: "7x8 Matrix", input: () => createCMatrix([[996, 821, 450, 669, 76, 353, 952, 16], [344, 523, 196, 484, 426, 682, 433, 228], [28, 678, 244, 604, 256, 653, 247, 981], [573, 806, 828, 383, 383, 435, 803, 892], [991, 634, 751, 692, 353, 935, 422, 297], [142, 145, 837, 999, 879, 757, 974, 904], [629, 158, 359, 530, 233, 911, 65, 703]]),
        output: createArray([996, 821, 450, 669, 76, 353, 952, 16, 228, 981, 892, 297, 904, 703, 65, 911, 233, 530, 359, 158, 629, 142, 991, 573, 28, 344, 523, 196, 484, 426, 682, 433, 247, 803, 422, 974, 757, 879, 999, 837, 145, 634, 806, 678, 244, 604, 256, 653, 435, 935, 353, 692, 751, 828, 383, 383]),
        enabled: true,
    },
    {
        name: "20x5 Matrix", input: () => createCMatrix([[312, 845, 869, 494, 667], [716, 660, 255, 130, 767], [121, 506, 480, 792, 334], [218, 639, 57, 434, 13], [14, 572, 501, 965, 729], [760, 359, 572, 123, 824], [275, 935, 466, 485, 721], [369, 892, 860, 334, 498], [968, 351, 177, 264, 542], [308, 574, 624, 823, 85], [246, 462, 960, 878, 954], [424, 829, 331, 50, 293], [504, 562, 668, 623, 508], [578, 20, 761, 773, 678], [959, 933, 995, 998, 837], [99, 741, 501, 841, 352], [965, 157, 114, 261, 118], [432, 221, 847, 713, 719], [664, 1, 737, 364, 702], [323, 310, 166, 280, 501]]),
        output: createArray([312, 845, 869, 494, 667, 767, 334, 13, 729, 824, 721, 498, 542, 85, 954, 293, 508, 678, 837, 352, 118, 719, 702, 501, 280, 166, 310, 323, 664, 432, 965, 99, 959, 578, 504, 424, 246, 308, 968, 369, 275, 760, 14, 218, 121, 716, 660, 255, 130, 792, 434, 965, 123, 485, 334, 264, 823, 878, 50, 623, 773, 998, 841, 261, 713, 364, 737, 1, 221, 157, 741, 933, 20, 562, 829, 462, 574, 351, 892, 935, 359, 572, 639, 506, 480, 57, 501, 572, 466, 860, 177, 624, 960, 331, 668, 761, 995, 501, 114, 847]),
        enabled: true,
    },
    {
        name: "1000x1000",
        input: () => createRandMatrix(1000, 1000),
        enabled: true,
        noCheck: true,
    },
    {
        name: "10000x10000",
        input: () => createRandMatrix(10000, 10000),
        enabled: true,
        noCheck: true,
    },
    {
        name: "10000x10000",
        input: () => createRandMatrix(10000, 10000),
        enabled: false,
        noCheck: true,
    },
    {
        name: "100000x30000",
        input: () => createRandMatrix(100000, 30000),
        enabled: false,
        noCheck: true,
    }
];


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
                    const isEqual = equalAB(curr, c.output);
                    expect(isEqual).toEqual(true);
                } else {
                    expect(1).toBe(1);
                }
            })
        );
});

const reportEl = document.querySelector("report");
prettify.toHTML(run(), reportEl);