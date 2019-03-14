package main

import (
	"net/http"
	"fmt"
	"strings"
	"log"
	"html/template"
	"time"
	"crypto/md5"
	"io"
	"strconv"
	"os"
)

type Person struct {
	Name string
	Id int
	Token string
}
type Personlist struct {
	Persons []Person
}
func sayhelloName(w http.ResponseWriter, r *http.Request) {
	r.ParseForm() //解析 url 传递的参数,对于 POST 则解析响应包的主体(request body) //注意:如果没有调用 ParseForm 方法,下面无法获取表单的数据
	fmt.Println(r.Form) //这些信息是输出到服务器端的打印信息
	fmt.Println("path", r.URL.Path)
	fmt.Println("scheme", r.URL.Scheme)
	fmt.Println(r.Form["url_long"])
	for k, v := range r.Form {
		fmt.Println("key:", k)
		fmt.Println("val:", strings.Join(v, ""))
	}
	fmt.Fprintf(w, "%v","Hello astaxie!") //这个写入到 w 的是输出到客户端的
}
func upload(w http.ResponseWriter, r *http.Request) {
	fmt.Println("method:", r.Method) //获取请求的方法
	if r.Method == "GET" {
		crutime := time.Now().Unix()
		h := md5.New()
		io.WriteString(h, strconv.FormatInt(crutime, 10))
		token := fmt.Sprintf("%x", h.Sum(nil))
		t, _ := template.ParseFiles("upload.gtpl")
		t.Execute(w, token)
	} else {
		/*r.ParseMultipartForm(32 << 20)
		file, handler, err := r.FormFile("uploadfile")
		if err != nil {
			fmt.Println(err)
			return
		}
		defer file.Close()
		fmt.Fprintf(w, "%v", handler.Header)
		f, err := os.OpenFile("./test/" + handler.Filename, os.O_WRONLY | os.O_CREATE, 0666)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer f.Close()
		io.Copy(f, file)*/
		r.ParseMultipartForm(8 << 20)
		fhs := r.MultipartForm.File["radio"]
		l := len(fhs)
		optionDirs := make([]string, l)
		for i := 0; i < l; i++ {
			file, err := fhs[i].Open()
			if err != nil {
				panic(err)
			}
			filename := fhs[i].Filename
			f, err := os.OpenFile("./test/" + filename, os.O_WRONLY | os.O_CREATE, 0666)
			if err != nil {
				panic(err)
			}
			defer f.Close()
			io.Copy(f, file)
			optionDirs = append(optionDirs, filename)
		}
	}
}
func login(w http.ResponseWriter, r *http.Request) {
	fmt.Println("method:", r.Method) //获取请求的方法
	if r.Method == "GET" {
		t, _ := template.ParseFiles("login.html")
		t.Execute(w, nil)
	} else {
		//请求的是登陆数据,那么执行登陆的逻辑判断
		fmt.Println("username:", r.FormValue("username"))
		fmt.Println("password:", r.FormValue("password"))
	}
}


func login1(w http.ResponseWriter, r *http.Request) {
	fmt.Println("method:", r.Method) //获取请求的方法
	if r.Method == "GET" {
		crutime := time.Now().Unix()
		h := md5.New()
		io.WriteString(h, strconv.FormatInt(crutime, 10))
		token := fmt.Sprintf("%x", h.Sum(nil))
		t, _ := template.ParseFiles("login.gtpl")
		mans:=Personlist{}
		mans.Persons=append(mans.Persons,Person{Name:"1111",Id:1111,Token:token},Person{Name:"2222",Id:2222})
		t.Execute(w, mans)
	} else {
		//请求的是登陆数据,那么执行登陆的逻辑判断
		r.ParseForm()
		token := r.Form.Get("token")
		if token != "" {
			//验证 token 的合法性
		} else {
			//不存在 token 报错
		}
		fmt.Println("username length:", len(r.Form["username"][0]))
		fmt.Println("username:",
			template.HTMLEscapeString(r.Form.Get("username"))) //输出到服务器 端
		fmt.Println("password:", template.HTMLEscapeString(r.Form.Get("password")))
		template.HTMLEscape(w, []byte(r.Form.Get("username"))) //输 出到客户端
	}
}
func main() {
	http.HandleFunc("/", sayhelloName) //设置访问的路由
	http.HandleFunc("/login", login1) //设置访问的路由
	http.HandleFunc("/upload", upload) //设置访问的路由
	err := http.ListenAndServe(":9090", nil) //设置监听的端口
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}