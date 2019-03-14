package simplemath

import (
	"time"
	"fmt"
)
func Add(a int, b int,c chan int) {
	fmt.Println(time.Now())
	v:=(a + b)
	c <- v
}
