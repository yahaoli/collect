package main

import (
	"net/http"
	"log"
	"fmt"
	"strings"
)

func helloHandel(w http.ResponseWriter, r *http.Request) {
	r.ParseForm() //解析参数,默认是不会解析的
	fmt.Println(r.Form) //这些信息是输出到服务器端的打印信息
	fmt.Println("path", r.URL.Path)
	fmt.Println("scheme", r.URL.Scheme)
	fmt.Println(r.Form["url_long"])
	for k, v := range r.Form {
		fmt.Println("key:", k)
		fmt.Println("val:", strings.Join(v, ""))
	}
	fmt.Fprintf(w, "Hello astaxie!") //这个写入到 w 的是输出到客户端的
}
func main() {
	http.HandleFunc("/", helloHandel)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}