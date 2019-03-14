var xmlHttp;
function createxmlHttpRequest()
{
    if(window.ActiveXObject)
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    else if(window.XMLHttpRequest)
        xmlHttp = new XMLHttpRequest();
}
function createQueryString()
{
    var firstName = document.getElementById("firstName").value;
    var birthday = document.getElementById("birthday").value;
    var queryString = "firstName="+firstName+"&birthday="+birthday;
    return encodeURI(encodeURI(queryString));//防止乱码
}
function doRequestUsingGet()
{
    createxmlHttpRequest();
    var queryString = "ajax2.asp?";
    queryString+=createQueryString()+"&timestamp="+new Date().getTime();
    xmlHttp.open("GET",queryString);
    xmlHttp.onreadystatechange = handleStateChange;
    xmlHttp.send(null);
}
function doRequestUsingPost()
{
    createxmlHttpRequest();
    var url ="ajax2.asp?timestamp="+new Date().getTime();
    var queryString = createQueryString();
    xmlHttp.open("POST",url);
    xmlHttp.onreadystatechange = handleStateChange;
    xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xmlHttp.send(queryString);

}
function handleStateChange()
{
    if(xmlHttp.readyState==4 && xmlHttp.status == 200)
    {
        var responseDiv = document.getElementById("serverResponse");
        responseDiv.innerHTML=decodeURI(xmlHttp.responseText);
    }
    alert(xmlHttp.responseText);
}
