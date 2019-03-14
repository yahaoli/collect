package main

import (
	"database/sql"
	_"github.com/Go-SQL-Driver/MySQL"
	"fmt"
	"encoding/json"
)

type Server struct {
	Id int `json:"id,omitempty"`
	Name string `json:"name,omitempty"`

}
type Serverslice struct {
	Servers [] Server
}
func main() {
	db, err := sql.Open("mysql", "root:liyahao@/koa1?charset=utf8")
	checkErr(err)
	//插入数据
	/*stmt, err := db.Prepare("INSERT userinfo SET username=?,departname=?,created=?")
	checkErr(err)
	res, err := stmt.Exec("astaxie", "研发部门", "2012-12-09")
	checkErr(err)
	id, err := res.LastInsertId()
	checkErr(err)
	fmt.Println(id)
	//更新数据
	stmt, err = db.Prepare("update userinfo set username=? where uid=?")
	checkErr(err)
	res, err = stmt.Exec("astaxieupdate", id)
	checkErr(err)
	affect, err := res.RowsAffected()
	checkErr(err)
	fmt.Println(affect)*/
	//查询数据
	rows, err := db.Query("SELECT id,name FROM user")
	checkErr(err)
	b,err:=json.Marshal(getJson(rows))
	checkErr(err)
	fmt.Println(string(b))
	c := []byte(`{"Name":"Wednesday","Age":6,"Parents":["Gomez","Morticia"]}`)
	m:=parseJson(c)
	val,ok:=m.(map[string]interface{})
	if(ok){
		fmt.Println(val["Name"])
	}
	//删除数据
	/*stmt, err = db.Prepare("delete from userinfo where uid=?")
	checkErr(err)
	res, err = stmt.Exec(id)
	checkErr(err)
	affect, err = res.RowsAffected()
	checkErr(err)
	fmt.Println(affect)*/
	db.Close()
}
func getJson(query *sql.Rows) []map[string]interface{}{
	rowsMap := make([]map[string]interface{}, 0, 10)
	columns,err:=query.Columns()
	checkErr(err)
	scanArgs := make([]interface{}, len(columns))
	values := make([]sql.RawBytes, len(columns))
	for i := range values {
		scanArgs[i] = &values[i]
	}
	for query.Next() { //循环，让游标往下移动
		 err := query.Scan(scanArgs...);
		checkErr(err)
		rowMap := make(map[string]interface{})
		for i, value := range values {
			rowMap[columns[i]] = string(value[:])
		}
		rowsMap = append(rowsMap, rowMap)
	}
	return rowsMap
}
func parseJson(a []byte) interface{} {
	var f interface{}
	err:=json.Unmarshal(a,&f)
	checkErr(err)
	return f
}
func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}