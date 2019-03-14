package main

import (
	"fmt"
)
//类
type Foo struct {
	Name string
}

func ( r *Foo)one() string{
	return r.Name
}

type Foo1 struct {
	Foo
	Name string
}
func main() {
	/*d := make(chan int, 2)
	go simplemath.Add(1, 2, d)
	go simplemath.Sqrt(4, d)
	a, b := <-d, <-d
	fmt.Println(a, b)*/
	myMap()
}


//goto
func myfunc() {
	i := 0
	HERE: fmt.Println(i)
	i++
	if i < 10 {
		goto HERE
	}
}
//数组的操作
func mytest1() {
	arr := make([]int, 0, 10)
	arr = append(arr, 3, 4, 5, 6, 7, 8, 9)
	fmt.Println(len(arr))
	for _, v := range arr {
		fmt.Println(v)
	}
}
//map 类似于json
type Person struct {
	Name string
	Id   string
}

func myMap() {
	var person1 map[string]Person
	person1 = map[string]Person{"1":{"jake", "123"}, "2":{"tom", "456"}}
	//delete(person1,"1")
	fmt.Println(person1)
	val, ok := person1["1"]
	if ok {
		fmt.Println(val)
	}
	//fmt.Println(person1["1"])
}
//if语句不能有多个 return
/*func testIf(a int)  {
	if a<5{
		return 0
	}else {
		return 1
	}
}*/
//多参数函数
func myTest2(args ...int) {
	for _, val := range args {
		fmt.Println(val)
	}
}
//任意类型参数
func myTest3(args ...interface{}) {
	for _, val := range args {
		fmt.Println(val)
	}
}
//错误处理

