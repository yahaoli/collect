/*//斐波那契数列的前20个数字
 var a = [];
 a[0] = "小明"
 a[1] = 1;
 a[2] = 2;
 for (var i = 3; i < 20; i++) {
 a[i] = a[i - 1] + a[i - 2]
 }
 console.log(a);
 //栈
 function Stack() {
 var items = [];
 this.push = function (element) {
 items.push(element);
 };
 this.pop = function () {
 return items.pop();
 };
 this.peek = function () {
 return items[items.length - 1];
 };
 this.isEmpty = function () {
 return items.length == 0;
 };
 this.size = function () {
 return items.length;
 };
 this.clear = function () {
 items = [];
 };
 this.print = function () {
 console.log(items.toString());
 };
 }*/
//单向链表

/*function LinkedList() {
 this.Node = function (element) { // {1}
 this.element = element;
 this.next = null;
 };
 this.length = 0; // {2}
 this.head = null; // {3}
 }
 LinkedList.prototype = {
 append: function (element) {
 var node = new this.Node(element), //{1}
 current;//{2}
 if (this.head === null) { //列表中第一个节点 //{3}
 this.head = node;
 } else {
 current = this.head; //{4}
 //循环列表,直到找到最后一项
 while (current.next) {
 current = current.next;
 }
 //找到最后一项,将其next赋为node,建立链接
 current.next = node; //{5}
 }
 this.length++; //更新列表的长度 //{6}
 },
 insert: function (position, element) {
 if (position >= 0 && position <= this.length) { //{1}
 var node = new this.Node(element),
 current = this.head,
 previous,
 index = 0;
 if (position === 0) { //在第一个位置添加
 node.next = current; //{2}
 this.head = node;
 } else {
 while (index++ < position) { //{3}
 previous = current;
 current = current.next;
 }
 node.next = current; //{4}
 previous.next = node; //{5}
 }
 this.length++; //更新列表的长度
 return true;
 } else {
 return false; //{6}
 }
 },
 removeAt: function (position) {
 if (position > -1 && position < this.length) { // {1}
 var current = this.head, // {2}
 previous, // {3}
 index = 0; // {4}
 //移除第一项
 if (position === 0) { // {5}
 this.head = current.next;
 } else {
 while (index++ < position) { // {6}
 previous = current;     // {7}
 current = current.next; // {8}
 }
 //将previous与current的下一项链接起来:跳过current,从而移除它
 previous.next = current.next; // {9}
 }
 this.length--; // {10}
 return current.element;
 } else {
 return null; // {11}
 }
 },
 remove: function (element) {
 var index = this.indexOf(element);
 return this.removeAt(index);
 },
 indexOf: function (element) {
 var current = this.head, //{1}
 index = 0;
 while (current) { //{2}
 if (element === current.element) {
 return index;       //{3}
 }
 index++;                //{4}
 current = current.next; //{5}
 }
 return -1;
 },
 isEmpty: function () {
 return this.length === 0;

 },
 size: function () {
 return this.length;
 },
 toString: function () {
 var current = this.head, //{1}
 string = '';    //{2}
 while (current) {   //{3}
 string += current.element; //{4}
 current = current.next;   //{5}
 }
 return string;                //{6}
 },
 getHead: function () {
 return this.head;
 }
 }
 var a = new LinkedList();
 a.append(2);
 a.append(3);
 a.append(4);
 a.append(5);
 a.insert(0, 1)
 //a.remove(2)
 console.log(a.toString());*/
//双向链表
/*
 function DoublyLinkedList() {
 this.Node = function (element) { // {1}
 this.element = element;
 this.prev = null;
 this.next = null;
 };
 this.length = 0; // {2}
 this.head = null; // {3}
 this.tail = null; // {4}
 }
 DoublyLinkedList.prototype = {
 append: function (element) {
 var node = new this.Node(element), //{1}
 current;//{2}
 if (this.head === null) { //列表中第一个节点 //{3}
 this.head = this.tail=node;
 } else {
 current = this.head; //{4}
 //循环列表,直到找到最后一项
 while (current.next) {
 current = current.next;
 }
 //找到最后一项,将其next赋为node,建立链接
 this.tail=current.next = node; //{5}
 node.prev=current;
 }
 this.length++; //更新列表的长度 //{6}
 },
 insert: function (position, element) {
 if (position >= 0 && position <= this.length) { //{1}
 var node = new this.Node(element),
 current = this.head,
 previous,
 index = 0;
 if (position === 0) { //在第一个位置添加
 if(!this.head){
 this.head=this.tail=node
 }else {
 node.next = current; //{2}
 current.prev=node
 this.head = node;
 }

 } else if(position===this.length){
 current=this.tail;
 current.next=node;
 node.prev=current;
 this.tail=node
 }else {
 while (index++ < position) { //{3}
 previous = current;
 current = current.next;
 }
 node.next = current; //{4}
 current.prev=node;
 node.prev=previous;
 previous.next = node; //{5}
 }
 this.length++; //更新列表的长度
 return true;
 } else {
 return false; //{6}
 }
 },
 removeAt: function (position) {
 if (position > -1 && position < this.length) { // {1}
 var current = this.head, // {2}
 previous, // {3}
 index = 0; // {4}
 //移除第一项
 if (position === 0) { // {5}
 this.head = current.next;
 if(this.length===1){
 this.tail=null
 }else{
 this.head.prev=null
 }
 } else if(position===this.length-1){
 current=this.tail
 this.tail=current.prev;
 this.tail.next=null;
 }else {
 while (index++ < position) { // {6}
 previous = current;     // {7}
 current = current.next; // {8}
 }
 //将previous与current的下一项链接起来:跳过current,从而移除它
 previous.next = current.next; // {9}
 current.next.prev=previous
 }
 this.length--; // {10}
 return current.element;
 } else {
 return null; // {11}
 }
 },
 remove: function (element) {
 var index = this.indexOf(element);
 return this.removeAt(index);
 },
 indexOf: function (element) {
 var current = this.head, //{1}
 index = 0;
 while (current) { //{2}
 if (element === current.element) {
 return index;       //{3}
 }
 index++;                //{4}
 current = current.next; //{5}
 }
 return -1;
 },
 isEmpty: function () {
 return this.length === 0;

 },
 size: function () {
 return this.length;
 },
 toString: function () {
 var current = this.head, //{1}
 string = '';    //{2}
 while (current) {   //{3}
 string += current.element; //{4}
 current = current.next;   //{5}
 }
 return string;                //{6}
 },
 getHead: function () {
 return this.head;
 },
 getTail: function () {
 return this.tail;
 }
 }
 var a = new DoublyLinkedList();
 a.append(2);
 a.append(3);
 a.append(4);
 a.append(5);
 a.insert(0, 1)
 //a.remove(2)
 console.log(a.indexOf(1));*/
//树
//二叉树
/*function BinarySearchTree() {
    this.Node = function (key) {
        this.key = key;
        this.left = null;
        this.right = null
    };
    this.root = null;
}
BinarySearchTree.prototype = {
    insert: function (key) {
        var newNode = new this.Node(key);
        if (this.root === null) {
            this.root = newNode;
        } else {
            this.insertNode(this.root, newNode)
        }
    },
    insertNode: function (node, newNode) {
        if (newNode.key < node.key) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                this.insertNode(node.left, newNode);
            }
        } else {
            if (node.right === null) {
                node.right = newNode
            } else {
                this.insertNode(node.right, newNode);
            }
        }
    },
    inOrderTraverse: function (callback) {
        var inOrderTraverseNode = function (node, callback) {
            if (node !== null) {
                inOrderTraverseNode(node.left, callback);
                callback(node.key);
                inOrderTraverseNode(node.right, callback);
            }
        };
        inOrderTraverseNode(this.root, callback);

    },
    preOrderTraverse: function (callback) {

        var preOrderTraverseNode = function (node, callback) {
            if (node !== null) {
                callback(node.key);
                preOrderTraverseNode(node.left, callback);
                preOrderTraverseNode(node.right, callback);
            }
        };
        preOrderTraverseNode(this.root, callback)
    },
    postOrderTraverse: function (callback) {
        var postOrderTraverseNode = function (node, callback) {
            if (node !== null) {
                postOrderTraverseNode(node.left, callback);
                postOrderTraverseNode(node.right, callback);
                callback(node.key);
            }
        }
        postOrderTraverseNode(this.root, callback)
    },
    printNode: function (value) {
        console.log(value)
    },
    minNode: function () {
        var a = this.root;
        if (a) {
            while (a && a.left) {
                a = a.left;
            }
            return a.key;
        }
        return null;
    },
    findMinNode:function (node) {
        var a = node;
        if (a) {
            while (a && a.left) {
                a = a.left;
            }
            return a;
        }
        return null;
    },
    maxNode: function () {
        var a = this.root;
        if (a) {
            while (a && a.right) {
                a = a.right;
            }
            return a.key;
        }
        return null;
    },
    searchNode: function (key) {
        function search(node, key) {
            if (node === null) {
                return false
            }
            if (key < node.key) {
                return search(node.left, key)
            } else if (key > node.key) {
                return search(node.right, key)
            } else {
                return true
            }
        }

        return search(this.root, key)
    },
    removeNode: function (key) {
        var that=this;
        function remove(node, key) {
            if (node === null) { //{2}
                return null;
            }
            if (key < node.key) { //{3}
                node.left = remove(node.left, key); //{4}
                return node; //{5}
            } else if (key > node.key) { //{6}
                node.right = remove(node.right, key); //{7}
                return node; //{8}
            } else {
                if (node.left === null && node.right === null) { //{9}
                    node = null; //{10}
                    return node; //{11}
                }
                if (node.left === null) { //{12}
                    node = node.right; //{13}
                    return node; //{14}
                }
                else if (node.right === null) { //{15}
                    node = node.left; //{16}
                    return node; //{17}
                }
                var aux = that.findMinNode(node.right); //{18}
                node.key = aux.key; //{19}
                node.right = remove(node.right, aux.key); //{20}
                return node; //{21}
            }
        }
       remove(this.root,key);//{1}
    }
}
;
var tree = new BinarySearchTree();
tree.insert(11);
tree.insert(7);
tree.insert(15);
tree.insert(5);
tree.insert(3);
tree.insert(9);
tree.insert(8);
tree.insert(10);
tree.insert(13);
tree.insert(12);
tree.insert(14);
tree.insert(20);
tree.insert(18);
tree.insert(25);
tree.removeNode(3);
//console.log(tree.root.key);
tree.inOrderTraverse(tree.printNode);
//console.log(tree.searchNode(3));*/
//lazyman
function _LazyMan(name) {
    this.tasks = [];
    var self = this;
    var fn =(function(n){
        var name = n;
        return function(){
            console.log("Hi! This is " + name + "!");
            self.next();
        }
    })(name);
    this.tasks.push(fn);
    setTimeout(function(){
        self.next();
    }, 0); // 在下一个事件循环启动任务
}
/* 事件调度函数 */
_LazyMan.prototype.next = function() {
    var fn = this.tasks.shift();
    fn && fn();
}
_LazyMan.prototype.eat = function(name) {
    var self = this;
    var fn =(function(name){
        return function(){
            console.log("Eat " + name + "~");
            self.next()
        }
    })(name);
    this.tasks.push(fn);
    return this; // 实现链式调用
}
_LazyMan.prototype.sleep = function(time) {
    var self = this;
    var fn = (function(time){
        return function() {
            setTimeout(function(){
                console.log("Wake up after " + time + "s!");
                self.next();
            }, time * 1000);
        }
    })(time);
    this.tasks.push(fn);
    return this;
}
_LazyMan.prototype.sleepFirst = function(time) {
    var self = this;
    var fn = (function(time) {
        return function() {
            setTimeout(function() {
                console.log("Wake up after " + time + "s!");
                self.next();
            }, time * 1000);
        }
    })(time);
    this.tasks.unshift(fn);
    return this;
}
/* 封装 */
function LazyMan(name) {
    return new _LazyMan(name)
}

LazyMan("zz").eat("lunch").sleep(3).eat("dinner")