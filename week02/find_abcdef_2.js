function match(str) {
    let state = start;
    for (const c of str) {
        state = state(c);
    }
    return state === end;
}

function start(c) {
    if (c === "a") {
        return foundA;
    } else {
        return start;
    }
}

function end(c) {
    return end;
}

function foundA(c) {
    if (c === "b") {
        return foundB;
    }
    return start(c);
}

function foundB(c) {
    if (c === 'c') {
        return foundC;
    } 
    return start(c);
}

function foundC(c) {
    if (c === 'd') {
        return foundD;
    } 
    return start(c);
}

function foundD(c) {
    if (c === 'e') {
        return foundE;
    }
    return start(c);
}

function foundE(c) {
    if (c === 'f') {
        return end;
    }
    return start(c);
}

console.log(match("abcdefg"));
console.log(match("abcadefg"));
console.log(match("ababcdefg"));