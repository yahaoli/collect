<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<form action="http://127.0.0.1:9090/login" method="post">
    用户名:<input type="text" name="username">
    密码:<input type="password" name="password">
    <input type="hidden" name="token" >
    {{range .Persons}}
    <span>{{.Name}}<span>
    <span>{{.Id}}<span>
    {{end}}
    <input type="submit" value="登陆">
</form>
</body>
</html>