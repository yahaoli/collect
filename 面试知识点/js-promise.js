const isFunction = variable => typeof variable === "function";

class Promise_ {
  constructor(fnc) {
    this.resolveArr = [];
    this.rejectArr = [];
    this.value = void 0;
    this.status = "pending";//pending、fulfilled、rejected;
    fnc(this._resolve.bind(this), this._reject.bind(this));
  }


  _resolve(val) {
    if (this.status !== "pending") return;
    let run = () => {
      this.status = "fulfilled";
      let fulfilled = () => {
        let fnc;
        while (fnc = this.resolveArr.shift()) {
          fnc();
        }
      };

      let rejected = () => {
        let fnc;
        while (fnc = this.rejectArr.shift()) {
          fnc();
        }
      };
      if (val instanceof Promise_) {
        val.then(value => {
          this.value = value;
          fulfilled();
        }, err => {
          this.value = err;
          rejected();
        });
      } else {
        this.value = val;
        fulfilled();
      }
    };
    setTimeout(run, 0);
  }

  _reject(err) {
    if (this.status !== "pending") return;
    let run = () => {
      this.value = err;
      this.status = "rejected";
      let fnc;
      while (fnc = this.rejectArr.shift()) {
        fnc(err);
      }
    };
    setTimeout(run, 0);
  }

  then(fuc, errFuc) {
    let _this = this;
    return new Promise_(function (nextResolve, nextReject) {
      function fulfilled() {
        try {
          if (isFunction(fuc)) {
            let callback = fuc(_this.value);
            if (callback instanceof Promise_) {
              callback.then(nextResolve, nextReject);
            } else {
              nextResolve(callback);
            }
          } else {
            nextResolve(_this.value);
          }
        } catch (e) {
          nextReject(e);
        }

      }

      function rejected() {
        try {
          if (isFunction(errFuc)) {
            let callback = errFuc(_this.value);
            if (callback instanceof Promise_) {
              callback.then(nextResolve, nextReject);
            } else {
              nextResolve(callback);
            }
          } else {
            nextReject(_this.value);
          }
        } catch (e) {
          nextReject(e);
        }
      }

      switch (_this.status) {
        case "pending":
          _this.resolveArr.push(fulfilled);
          _this.rejectArr.push(rejected);
          break;
        case "fulfilled":
          fulfilled();
          break;
        case "rejected":
          rejected();
          break;
      }
    });

  }

  catch(fuc) {
    this.then(undefined, fuc);
  }

  finally(cb) {
    return this.then(
      value => Promise_.resolve(cb()).then(() => value),
      reason => Promise_.resolve(cb()).then(() => {
        throw reason;
      })
    );
  }

  static resolve(val) {
    if (val instanceof Promise_) return val;
    return new Promise_((resolve) => resolve(val));
  }

  static reject(val) {
    return new Promise_((resolve, reject) => reject(val));
  }

  static all(list) {
    return new Promise_(function (resolve, reject) {
      var value = [], len = list.length, count = 0;
      for (var i = 0; i < list.length; i++) {
        (function (i) {
          Promise_.resolve(list[i]).then(function (val) {
            value[i] = val;
            count = count + 1;
            count === len && resolve(value);
          }, function (err) {
            reject(err);
          });
        })(i);
      }
      ;
    });

  }
}


