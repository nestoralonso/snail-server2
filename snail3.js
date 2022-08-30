//@ts-check

// Following constants are vectors that indicate the direction of movement
const RIGHT = [0, 1];
const DOWN = [1, 0];
const LEFT = [0, -1];
const UP = [-1, 0];
const NONE = [0x013, 0x013];

// key: current direction, value: next direction
const NextDirectionMap = new Map([
    [RIGHT, DOWN],
    [DOWN, LEFT],
    [LEFT, UP],
    [UP, RIGHT],
]);

// just to print direction name for debugging
const DirectionName = new Map([
    [RIGHT, "Right"],
    [DOWN, "Down"],
    [LEFT, "Left"],
    [UP, "Up"],
]);

/**
 * @param {any} m
 */
function snail(m) {
    if (!m || m.rows < 1 || m.cols < 1) {
        return [];
    }

    const length = m.rows * m.cols;
    let i = 0;
    let j = 0;
    let maxJ = m.cols - 1;
    let maxI = m.rows - 1;
    let minJ = 0;
    let minI = 0;
    let curDir = RIGHT;

    let arI = 0;
    const resSegments = [];

    // initial segment length
    let segLength = m.cols;

    let c = 0;
    do {
        resSegments.push([curDir, arI, i, j, minI, maxI, minJ, maxJ, segLength]);
        arI += segLength;
        [i, j, minI, maxI, minJ, maxJ, segLength] = nextSegment(curDir, i, j, minI, maxI, minJ, maxJ);
        curDir = nextDirection(curDir);
        c++;
    } while (arI < length); // < 28);

    return resSegments;
}


function directionToString(dir) {
    return DirectionName.get(dir);
}

function nextDirection(currDir) {
    const res = NextDirectionMap.get(currDir) ?? NONE;

    return res;
}

function nextSegment(dir, ci, cj, minI, maxI, minJ, maxJ) {
    let length = 0;
    if (dir === RIGHT) {
        cj = maxJ;
        minI++;
        ci++;
        length = maxI - ci + 1;
    } else if (dir === DOWN) {
        ci = maxI;
        maxJ--;
        cj--;
        length = cj - minJ + 1;
    } else if (dir === LEFT) {
        cj = minJ;
        maxI--;
        ci--;
        length = ci - minI + 1;
    } else if (dir === UP) {
        ci = minI;
        minJ++;
        cj++;
        length = maxJ - cj + 1;
    }

    return [ci, cj, minI, maxI, minJ, maxJ, length];
}

function copyMatrix(mJs, mInt32) {
    let ix = 0;
    for (let i = 0; i < mJs.length; i++) {
        const row = mJs[i];
        for (let j = 0; j < row.length; j++) {
            mInt32.data[ix] = row[j];
            ix++;
        }
    }
}

function createMatrix(mJs) {
    let ix = 0;
    const rows = mJs.length;
    const cols = mJs?.[0]?.length ?? 0;
    const sharedArrayBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * (rows * cols));
    const mInt32 = new Int32Array(sharedArrayBuffer);

    for (let i = 0; i < mJs.length; i++) {
        const row = mJs[i];
        for (let j = 0; j < row.length; j++) {
            mInt32[ix] = row[j];
            ix++;
        }
    }

    return {
        data: mInt32,
        rows,
        cols,
    };
}

function createRandMatrix(rows, cols) {
    let ix = 0;
    const sharedArrayBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * (rows * cols));
    const mInt32 = new Int32Array(sharedArrayBuffer);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            mInt32[ix] = Math.floor(Math.random() * 1000);
            ix++;
        }
    }

    return {
        data: mInt32,
        rows,
        cols,
    };
}

function createArray(arJs) {
    const sharedArrayBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * arJs.length);
    const arInt32 = new Int32Array(sharedArrayBuffer);

    for (let i = 0; i < arJs.length; i++) {
        arInt32[i] = arJs[i];
    }

    return arInt32;
}

function equalAB(ab1, ab2) {
    if (ab1.length !== ab2.length) return false;
    for (let i = 0; i < ab1.length; i++) {
        if (ab1[i] !== ab2[i]) return false;
    }

    return true;
}

function mat20x5() {

    const m = [
        [1, 2, 3, 4, 5],
        [46, 47, 48, 49, 6],
        [45, 84, 85, 50, 7],
        [44, 83, 86, 51, 8],
        [43, 82, 87, 52, 9],
        [42, 81, 88, 53, 10],
        [41, 80, 89, 54, 11],
        [40, 79, 90, 55, 12],
        [39, 78, 91, 56, 13],
        [38, 77, 92, 57, 14],
        [37, 76, 93, 58, 15],
        [36, 75, 94, 59, 16],
        [35, 74, 95, 60, 17],
        [34, 73, 96, 61, 18],
        [33, 72, 97, 62, 19],
        [32, 71, 98, 63, 20],
        [31, 70, 99, 64, 21],
        [30, 69, 100, 65, 22],
        [29, 68, 67, 66, 23],
        [28, 27, 26, 25, 24]
    ];

    return m;
}

