



### 第一步 文件拆分

- 为了方便文件管理，我们把parser单独拆到文件中 
- parser接受HTML文本作为参数，返回一颗DOM树



### 第二步 创建FSM 解析

- 我们用FSM来实现HTML的分析
- 在HTML标准中，已经规定了HTML的状态
- Toy-Browser只挑选其中一部分状态，完成一个最简版本



### 第三步 解析标签

- 主要的标签有:开始标签，结束标签和自封闭标签



### 第四步 创建元素

- 在状态机中，除了状态迁移，我们还会要加入业务逻辑 
-  我们在标签结束状态提交标签token



### 第五步 处理属性

- 属性值分为单引号、双引号、无引号三种写法，因此需要较多状 态处理
- 处理属性的方式跟标签类似
-  属性结束时，我们把属性加到标签Token上



### 第六步 构造DOM树

- 从标签构建DOM树的基本技巧是使用栈
- 遇到开始标签时创建元素并入栈，遇到结束标签时出栈 
- 自封闭节点可视为入栈后立刻出栈
- 任何元素的父元素是它入栈前的栈顶



### 第七步 文本节点

- 文本节点与自封闭标签处理类似 
- 多个文本节点需要合并