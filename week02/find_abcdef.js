function match(str) {
    let matchStr = "abcdef";
    if (str.length < matchStr.length) {
        return false;
    }
    for (let i = 0; i < str.length - matchStr.length + 1; i++) {
        if (str[i] === 'a' && str[i+1] === 'b' && str[i+2] === 'c' &&
            str[i+3] === 'd' &&  str[i+4] === 'e' && str[i+5] === 'f') {
            return true;
        }
    }
    return false;
}
console.log(match("abcdefg"));
console.log(match("abcadefg"));
console.log(match("ababcdefg"));