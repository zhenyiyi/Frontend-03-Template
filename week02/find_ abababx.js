function match(str) {
    let matchStr = "abababx";
    let state = start;
    for (const c of str) {
        state = state(c);
    }
    return state === end;
}

function start(c) {
    if (c === 'a') {
        return foundA;
    }
    return start;
}

function foundA(c) {
    if (c === 'b') {
        return foundB;
    }
    return start(c);
}

function foundB(c) {
    if (c === 'a') {
        return foundA2;
    }
    return start(c);
}

function foundA2(c) {
    if (c === 'b') {
        return foundB2;
    }
    return start(c);
}

function foundB2(c) {
    if (c === 'a') {
        return foundA3;
    }
    return foundB(c);
}

function foundA3(c) {
    if (c === 'b') {
        return foundB3;
    }
    return start(c);
}

function foundB3(c) {
    if (c === 'x') {
        return end;
    }
    return foundB2(c);
}

function end(c) {
    return end;
}

console.log(match("abababx"));
console.log(match("abababababx"));
console.log(match("abxababababx"));
