function match(str) {
    let matchStr = 'abcabx';
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
    if (c === 'c') {
        return foundC;
    }
    return start(c);
}

function foundC(c) {
    if (c === 'a') {
        return foundA2;
    }
    return start(a);
}

function foundA2(c) {
    if (c === 'b') {
        return foundB2;
    }
    return start(c);
}

function foundB2(c) {
    if (c === 'x') {
        return end;
    }
    // 交给 foundB 来处理， 否则会出现 ‘abcabcabx’ 匹配不成功
    return foundB(c);
}

function end(c) {
    return end;
}

console.log(match("abcabx"));
console.log(match("abcabcabx"));
console.log(match("abcabxaaa"));
console.log(match("abcaabcabxa"));
