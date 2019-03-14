package models

import (
	"database/sql"
	"fmt"
)
var db *sql.DB
var flag bool=true
func Pool() *sql.DB {
	if flag{
		fmt.Println(12333333)
		db, _ = sql.Open("mysql", "root:liyahao@/koa1?charset=utf8")
		db.SetMaxOpenConns(20)
		db.SetMaxIdleConns(10)
		db.Ping()
		flag=false
	}
	return db
}