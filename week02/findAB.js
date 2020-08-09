
/**
 * 
 * @param {string} str 
 * @param {string} matchStr 
 */
function match(str, matchStr) {
    let reg = new RegExp(`${matchStr}`);
    console.log(reg);
    return reg.test(str);
}

console.log(match("abc", "ab"));

console.log("******************************");
function match2(str) {
    let foundA = false;
    for (const item of str) {
        if (item === 'a') {
            foundA =  true;
        } else if (foundA && item === 'b') {
            return true;
        } else {
            foundA = false;
        }
    }
    return false;
}

console.log(match2("abc"));
console.log(match2("acb"));



