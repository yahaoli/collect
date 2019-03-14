package main

import (
	"fmt"
	"./scrypt"
)

func main() {
	str:="liyahao"
	salt :=[]byte("xiaoming")
	dk, _ := scrypt.Key([]byte(str), salt, 16384, 8, 1, 32)
	key:=fmt.Sprintf("%x",dk)
	fmt.Println(key)
}
