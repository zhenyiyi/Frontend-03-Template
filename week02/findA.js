function findLetter(str, c) {
    if (typeof str != 'string' || typeof c != 'string') return false;
    for (let ch of str) {
        if (ch === c) {
            return true;
        }
    }
    return false;
}

console.log(findLetter("abc", "a"));
console.log(findLetter("dbc", "a"));
