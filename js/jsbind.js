function T(c) {
    this.id = "Object";
    this.dom = document.getElementById("scroll");
}
T.prototype = {
    init: function() {
        //①
        this.dom.onmouseover = function() {
            console.log("Over-->"+this.id);
        }
        //②
        this.dom.onmouseout = function() {
            console.log("Out -->"+this.id);
        } .bind(this)
    }
};
(new T()).init();