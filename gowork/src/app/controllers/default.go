package controllers

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/context"
	"fmt"
	"strconv"
	"os"
	"io"
	"github.com/astaxie/beego/orm"
)
type MainController struct {
	beego.Controller
}
var flag=true
var FilterUser = func(ctx *context.Context) {
	_, ok := ctx.Input.Session("id").(int)
	if !ok && ctx.Request.RequestURI != "/login" {
		ctx.WriteString("no login")
	}
}
func (this *MainController) Prepare() {
	beego.InsertFilter("/session/*",beego.BeforeRouter,FilterUser)
}
func MySql() orm.Ormer{
	if flag{
		orm.RegisterDriver("mysql", orm.DRMySQL)
		orm.RegisterDataBase("default", "mysql", "root:liyahao@/koa1?charset=utf8")
		flag=false
	}
	o := orm.NewOrm()
	return o
}
func (c *MainController) Json() {
	var maps []orm.Params
	num, err := MySql().Raw("SELECT id,name FROM user").Values(&maps)
	if err == nil && num > 0 {
		//fmt.Println(maps)
	}
	result:=map[string]interface{}{"err":false,"list":maps}
	c.Data["json"]=result
	c.ServeJSON()
	/*fmt.Println(string(a))
	c.Ctx.WriteString(string(a))*/
}
func (c *MainController) Index() {
	/*rows, err := models.Pool().Query("SELECT id FROM user")
	defer rows.Close()
	checkErr(err)
	b,err:=json.Marshal(getJson(rows))
	checkErr(err)*/

	var maps []orm.Params
	num, err := MySql().Raw("SELECT id,name FROM user").Values(&maps)
	if err == nil && num > 0 {
		fmt.Println(maps)
	}
	c.Data["Website"] = "beego.me"
	c.Data["Email"] = "astaxie@gmail.com"
	c.Data["xsrf_token"] = c.XSRFToken()
	c.Data["mysql"]=maps
	c.TplName = "index.tpl"
}
func (c *MainController) IndexPost() {
	name := c.GetString("name")
	id := c.Input().Get("id")
	intid, _ :=strconv.Atoi(id)
	fmt.Println(name,intid+1)
}
func (c *MainController)  Upload(){
	r:=c.Ctx.Request;
	r.ParseMultipartForm(8 << 20)
	fhs := r.MultipartForm.File["files"]
	l := len(fhs)
	optionDirs := make([]string, l)
	for i := 0; i < l; i++ {
		file, err := fhs[i].Open()
		if err != nil {
			panic(err)
		}
		filename := fhs[i].Filename
		f, err := os.OpenFile("static/upload/" + filename, os.O_WRONLY | os.O_CREATE, 0666)
		if err != nil {
			panic(err)
		}
		defer f.Close()
		io.Copy(f, file)
		optionDirs = append(optionDirs, filename)
	}
}
func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}