/*jshint esversion: 6 */

const EOF = Symbol("EOF"); // 唯一性
const css = require("css");
/**
 * 
 * 开始标签, 结束标签 自封闭标签
 */

let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;
let rules = [];

let stack = [{
    type: "document",
    children: []
}];

function specialficiy(selector) {
    var p = [0, 0, 0, 0];
    var selectorParts = selector.split(" ");
    for (const part of selectorParts) {
        if (part[0] === "#") {
            p[1] += 1;
        } else if (part[1] === ".") {
            p[2] += 1;
        } else {
            p[3] += 1;
        }
    }
    return p;
}

function compare(sp1, sp2) {
    if (sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0];
    } 
    if (sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1];
    }
    if (sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2];
    }
    return sp1[3] - sp2[3];
}

function  match(element, selector) {
    if (!selector || !element.attributes) {
        return false;
    }
    if (selector[0] === "#") {
        let attr = element.attributes.filter(attr => attr.name == "id");
        if (attr.length && attr[0].value === selector.replace('#','')) {
            return true;
        }
    } else if (selector[0] == "."){
        let attr = element.attributes.filter(attr => attr.name == "class");
        if (attr.length && attr[0].value === selector.replace(".", "")) {
            return true;
        }
    } else {
        if (element.tagName == selector) {
            return true;
        }
    }
    return false;
}

function computeCss(element) {
    // console.log(`rules = ${rules}`);
    // console.log("compute Css for element", element);
    let elements = stack.slice().reverse();
    // console.log(elements);
    for (const rule of rules) {
        var selectorParts = rule.selectors[0].split(" ").reverse();
        if (selectorParts.indexOf("#myid") != -1) {
            console.log(selectorParts);
        }
        if (!match(element, selectorParts[0])) {
            continue;
        }
        let matched = false;
        let j = 1;
        for (let i = 0; i < elements.length; i++) {
            if (match(elements[i], selectorParts[j])) {
                j++;
            }
        }
        if (j >= selectorParts.length) {
            matched = true;
        }
        if (matched) {
            var sp = specialficiy(rule.selectors[0]);
            var computedStyle = element.computedStyle;
            for (const item of rule.declarations) {
                if (!computedStyle[item.property]) {
                    computedStyle[item.property] = {};
                }
                if (!computedStyle[item.property].specialficiy) {
                    computedStyle[item.property].value = item.value;
                    computedStyle[item.property].specialficiy = sp;
                } else if (compare(computedStyle[item.property].specialficiy, sp) < 0) {
                    computedStyle[item.property].value = item.value;
                    computedStyle[item.property].specialficiy = sp;
                }
            }
            console.log("matched", element, computedStyle);
        }
    }
}
function addCssRules(styles) {
    var ast = css.parse(styles);
    console.log(JSON.stringify(ast, null), "   ");
    rules.push(...ast.stylesheet.rules);
}

function emit(token) {
    console.log(token);
    let top = stack[stack.length-1];
    if (token.type == "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: []
        };
        element.tagName = token.tagName;
        for (let p in token) {
            if (p != "type" && p != "tagName") {
                element.attributes.push({
                    name: p,
                    value: token[p]
                });
            }
        }
        element.computedStyle = {};
        computeCss(element);
        top.children.push(element);
        token.top = top;
        if (!token.isSelfClosing) {
            stack.push(element);
        }
        currentTextNode = null;
    } else if (token.type == "endTag") {
        if (top.tagName != token.tagName) {
            throw new Error("Tag start end do not match!");
        } else {
            if (token.tagName == "style") {
                addCssRules(top.children[0].content);
            }
            stack.pop();
        }
        currentTextNode = null;
    } else if (token.type == "text") {
        if (currentTextNode == null){
            currentTextNode = {
                name: "text",
                content: ""
            };
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    } else if (token.type == "EOF") {
        return ;
    }
}

/**
 * 初始状态, 仅读取以 ”<“ 开始的字符
 * @param {string} c 
 */
function data(c) {
    if (c === '<') {
        return tagOpen;
    } else if (c === EOF) {
        emit({
            type: "EOF"
        });
        return ;
    } else {
        emit({
            type: "text",
            content: c
        });
        return data; 
    }
}

/**
 * 标签开始
 * @param {string} c 
 */
function tagOpen(c) {
    if (c === '/') {
        return endTagOpen;
    } else if (c.match(/^[a-zA-z]$/)) {
        currentToken = {
            type: "startTag",
            tagName: ""
        };
        return tagName(c);
    } else {
        return ;
    }
}

/**
 * 标签结束 
 * @param {string} c 
 */
function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName: ""
        };
        return tagName(c);
    } else if(c == ">"){
        
    } else if (c === EOF) {

    } else {
        
    }
}

/**
 * 标签名字
 * @param {string} c 
 */
function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === '>') {
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

/**
 * 属性开始
 * @param {string} c 
 */
function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c == '/' || c == '>' || c == EOF){
        return afterAttributeName(c);
    } else if (c === '=') {

    } else {
        currentAttribute = {
            name: "",
            value: ""
        };
        return attributeName(c);
    }
}

function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c == "=") {
        return beforeAttributeName;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: "",
            value: "" 
        };
        return attributeName(c);
    }
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c);
    } else if (c == "=") {
        return beforeAttributeValue;
    } else if (c == "\u0000") {

    } else if (c == "\"" || c == "'"  || c == "<") {

    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) ) {
        return beforeAttributeValue;
    } else if (c == ">") {
        return data;
    } else if (c == "/" || c == EOF) {

    } else if (c == "\"") {
        return doubleQuotedAttributeValue;
    } else if (c == "\'") {
        return singleDuotedAttributeValue;
    } else {
        return unQuotedAttributeValue(c);
    }
}

function doubleQuotedAttributeValue(c) {
    if (c == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c == "\u0000"){
        
    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return afterQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(c) {
    if (c == "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterSingleAttributeValue;
    } else if (c == "\u0000"){
        
    } else if (c == EOF) {

    } else {
        currentAttribute.name += c;
        return singleQuotedAttributeValue;
    }
}

function afterSingleAttributeValue(params) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
}

function unQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c == "/") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == "\u0000") {

    } else if (c == "\"" || c == "\'" || c == "<" || c == "=" || c == "`") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return unQuotedAttributeValue;
    }
}

/**
 * 自封闭标签， 
 * @param {string} c 
 */
function selfClosingStartTag(c) {
    if (c == '>') {
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if (c === EOF){
        
    } else {

    }
}



module.exports.parserHTML = function parserHTML(html) {
    console.log(html);
    let state = data;
    for (const c of html) {
        state = state(c);
    }
    state = state(EOF);
    return stack[0];
};
