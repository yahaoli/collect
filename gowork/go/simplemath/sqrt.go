package simplemath

import (
	"math"
	"fmt"
	"time"
)

func Sqrt(i int,c chan int) {
	fmt.Println(time.Now())
	v := math.Sqrt(float64(i))
	c<-int(v)
}
