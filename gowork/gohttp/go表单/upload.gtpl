<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<form enctype="multipart/form-data" action="http://127.0.0.1:9090/upload" method="post">
    <input type="file" multiple name="radio"/>
    <input type="hidden" name="token" value="{{.}}"/> <input type="submit" value="upload"/>
</form>
</body>
</html>