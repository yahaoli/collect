package main

import (
	_ "app/routers"
	"github.com/astaxie/beego"
	_ "github.com/astaxie/beego/session/mysql"
	_ "github.com/go-sql-driver/mysql"
)
func main() {
	beego.Run()
}

