/*function sendPost(){
    var postStr, ifrm;
    console.log('start');
    postStr =1;
    ifrm = document.createElement("iframe");
    ifrm.setAttribute("id",'commentFrm');
    ifrm.src='about:blank';
    ifrm.setAttribute("frameborder","0");
    ifrm.setAttribute("name",'commentFrm');
    ifrm.contentDocument.write('<form method="POST" action="http://localhost:3000/custom/uphotoimg"><textarea name="txtData">'+postStr+'</textarea></form>');
    ifrm.contentDocument.forms[0].submit();
}*/
$.ajax({
    url: 'http://localhost:3000/custom/uphotoimg',
    crossDomain: true,
    dataType: "jsonp",
    jsonpCallback:'aaaa',
    data: {"some":"json"},
    success: function(data) {
        console.log(data)
    },
    error: function (data) {
        alert('POST failed.');
    }
});