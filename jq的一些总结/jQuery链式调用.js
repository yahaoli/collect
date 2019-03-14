var jq=function (select,context) {
    return new jq.prototype.init();
};
jq.prototype={
    init:function () {
        console.log(1111);
        return this;
    },
    name:function () {
        console.log(this.age);
        return this.age;
    },
    age:'xiaoming'
};
jq.prototype.init.prototype=jq.prototype;
jq().name();