(function(){
  /*  const pi=123456;//声明即不可变
    console.log(pi)*/
   /* var  arrayLike = {
        '0': '1',
        '1': '2',
        '2': '3',
        length: 3
    };
    var arr2=Array.from(arrayLike);//es6写法
    var arr1=[].slice.call(arrayLike);//es6写法
    //console.log(arr1+' es6 '+arr2);

    //console.log(  [1,2,3,4,10].find(function(value,index,arr){return value>9;}))
    var s1=Symbol();
    var a={
        [s1]:function(index){
            console.log(index)
        }
    };*/
   //console.log(a[s1](1));
  /*  var arr=['a','b','c'];
    var iter=arr[Symbol.iterator]();
    console.log(iter.next());
    console.log(iter.next());
    console.log(iter.next());
    console.log(iter.next());*/
    /*function* hello(){
        yield 'hello';
        yield 'world';
        return 'ending';
    }
       var hw=hello();
    console.log(hw.next());
    console.log(hw.next());
    console.log(hw.next());
    console.log(hw.next());*/
   /* function* foo(x) {
        var y = 2 * (yield (x + 1));
        var z = yield (y / 3);
        return (x + y + z);
    }
    var b = foo(5);
    console.log(b.next() );// { value:6, done:false }
    console.log(b.next(12) );// { value:8, done:false }
    console.log(b.next(13) );// { value:42, done:true }*/
   /* function* dataConsumer() {
        console.log('Started');
        console.log(`1. ${yield}`);
        console.log(`2. ${yield}`);
        return 'result';
    }

    var  genObj = dataConsumer();
    genObj.next();
// Started
    genObj.next('a')
// 1. a
    genObj.next('b')*/
   /* function *foo() {
        yield 1;
        yield 2;
        yield 3;
        yield 4;
        yield 5;
        return 6;
    }

    for (var v of foo()) {
        console.log(v);
    }*/
    /*var gen = function* gen(){
        try {
            yield console.log('a');
        } catch (e) {
            // ...
        }
        yield console.log('b');
        yield console.log('c');
    }

    var g = gen();
    g.next() // a
    g.throw() // b
    g.next() // c*/
  /*  function* inner() {
        yield 'hello!';
    }

    function* outer1() {
        yield 'open';
        yield inner();//调用别的generator函数
        yield 'close';
    }

    var gen = outer1();
    gen.next().value // "open"
    gen.next().value // 返回一个遍历器对象
    gen.next().value // "close"

    function* outer2() {
        yield 'open'
        yield* inner()
        yield 'close'
    }

    var gen = outer2()
    gen.next().value // "open"
    gen.next().value // "hello!"
    gen.next().value*/
/*    function* iterTree(tree) {
        if (Array.isArray(tree)) {
            for(var i=0; i < tree.length; i++) {
                yield* iterTree(tree[i]);
            }
        } else {
            yield tree;
        }
    }

    const tree = [ 'a', ['b', 'c'], ['d', 'e'] ];

    for(var x of iterTree(tree)) {
        console.log(x);
    }*/
    /*function* F() {
        this.a = 1;//generator返回的是便利器obj所以不能构造this.
        yield this.b = 2;
        yield this.c = 3;
    }
    var obj = {};
    var f = F.call(obj);//利用call函数把obj绑定到F()函数内

    f.next();  // Object {value: 2, done: false}
    f.next();  // Object {value: 3, done: false}
    f.next();  // Object {value: undefined, done: true}

    obj.a // 1
    obj.b // 2
    obj.c // 3*/
    /*function* F() {
        this.a = 1;
        yield this.b = 2;
        yield this.c = 3;
    }
    var f = F.call(F.prototype);

    f.next();  // Object {value: 2, done: false}
    f.next();  // Object {value: 3, done: false}
    f.next();  // Object {value: undefined, done: true}

    f.a // 1
    f.b // 2
    f.c // 3*/
   /* function* gen() {
        this.a = 1;
        yield this.b = 2;
        yield this.c = 3;
    }

    function F() {
        return gen.call(gen.prototype);
    }

    var f = new F();

    f.next();  // Object {value: 2, done: false}
    f.next();  // Object {value: 3, done: false}
    f.next();  // Object {value: undefined, done: true}

    f.a // 1
    f.b // 2
    f.c // 3*/
  /* var promise = new Promise(function(resolve, reject) {
        console.log('Promise');
        resolve();
    });

    promise.then(function() {
        console.log('Resolved.');
    });

    console.log('Hi!');*/
 /*   var someAsyncThing = function() {
        return new Promise(function(resolve, reject) {
            // 下面一行会报错，因为x没有声明
            resolve(x + 2);
        });
        someAsyncThing().then(function() {
            return someAsyncThing();
        }).catch(function(error) {
            console.log('oh no', error);
            // 下面一行会报错，因为y没有声明
            y + 2;
        }).catch(function(error) {
            console.log('carry on', error);
        });
    };*/
  /*  class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        toString(){
            console.log(this.x+" "+this.y)
        }
    }

    class ColorPoint extends Point {
        constructor(x, y, color) {
            super(x, y);
            this.color = color; // 正确
        }
    }
    var a=new ColorPoint(1,2,3);
    a.toString();*/

    function getFoo () {
        return new Promise(function (resolve, reject){
            resolve('aaaaaaaa');
        });
    }

    var g = function* () {
        try {
            var foo = yield getFoo();
            console.log(foo);
        } catch (e) {
            console.log(e);
        }
    };

    function run (generator) {
        var it = generator();

        function go(result) {
            if (result.done) return result.value;

            return result.value.then(function (value) {
                return go(it.next(value));
            }, function (error) {
                return go(it.throw(error));
            });
        }

        go(it.next());
    }

    run(g);
})();