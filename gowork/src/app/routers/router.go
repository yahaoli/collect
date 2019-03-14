package routers

import (
	"app/controllers"
	"github.com/astaxie/beego"
)

func init() {
    beego.Router("/", &controllers.MainController{},"get:Index")
    beego.Router("/index", &controllers.MainController{},"post:IndexPost")
    beego.Router("/session/upload", &controllers.MainController{},"post:Upload")
    beego.Router("/json", &controllers.MainController{},"post:Json")
}
