class Sub {
  constructor() {
    this.subJson = {};
  }

  on(key, fn) {
    let current = this.subJson[key] = this.subJson[key] || {};
    let fnArr = current.fnArr = current.fnArr || [];
    fnArr.push(fn);
  }

  emit(key, value) {
    let fnArr = (this.subJson[key] || {}).fnArr;
    if (fnArr && fnArr.length) {
      fnArr.forEach(fn => fn(value));
    }
  }
}

let sub = new Sub();
sub.on("test", (value) => {
  console.log(value);
});
sub.on("test", (value) => {
  console.log(value);
});
sub.emit("test", "叫爸爸");