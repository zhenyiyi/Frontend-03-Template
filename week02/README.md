### 1. 浏览器是到底如何工作的？

就是把URL变成一个屏幕上显示的网页。

1. 浏览器使用**HTTP**或者**HTTPS**协议，向服务器请求页面；
2. 把请求回来的**HTML**代码经过解析，构建成**DOM**树；
3. 计算**DOM**树上的**CSS**属性；
4. 最后根据**CSS**属性对元素逐个进行渲染，得到内存中的**位图**；
5. 一个可选的步骤是对**位图**进行合成，这会极大地增加后续绘制的速度；
6. 合成之后，再绘制到页面上。



从**HTTP**请求回来，就产生了流式的数据，后续的**DOM**树构建、**CSS**计算、渲染，合成，绘制，都是尽可能地流式处理前一步的产出：即不需要等到上一步骤完全结束，就开始处理上一步的输出，这样我们在浏览网页时，才会看到逐步出现的页面。



### 2. 有限状态机



- 每一个状态都是一个机器

  - 在每一个机器里，我们可以做计算、存储、输出……
  - 所有的机器接受的输入是一致的
  - 状态机的每一个机器本身没有状态，如果我们用函数来表示的话，那么他就是纯函数

- 每一个机器知道下一个状态

  - 每个机器都有确定的下一个状态 （Moore）
  - 每一个机器都是根据输入决定下一个状态（Mealy）

- JS 中的有限状态机（Mealy）

  ```js
  function state(input) {
  	// 在函数中，可以自由地编写代表，处理每个状态的逻辑；
  	return next;
  }
  
  /// 以下是调用
  while(input) {
    state = state(input);
    // 把状态机的返回值作为下一个状态
  }
  ```

###  3. 不使用正则表达式来匹配`abcdef`

不使用状态机的写法

```js
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

```



使用状态机的写法

```js
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
```



匹配**abcabx**

```js
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

```



###### 我们如何用状态机处理完全未知的 pattern？

> https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm

