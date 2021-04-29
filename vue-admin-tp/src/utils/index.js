export default {
  // 判断变量是否为空
  isNull(variable1) {
    return variable1 === null || variable1 === undefined || variable1 === "";
  },
  // 判断json是否为空
  isEmptyJson(obj) {
    for (var key in obj) {
      return false;
    }
    return true;
  },
  // 验证整数
  integer: function(rule, value, callback) {
    if (callback) {
      if (value && !/^[0-9]+$/.test(value)) {
        return callback(new Error("请输入整数"));
      }
      callback();
    } else {
      return /^[0-9]+$/.test(value);
    }
  },
  // 验证整数和字母
  integerEn: function(rule, value, callback) {
    if (callback) {
      if (value && !/^[0-9a-zA-Z]+$/.test(value)) {
        return callback(new Error("请输入整数"));
      }
      callback();
    } else {
      return /^[0-9a-zA-Z]+$/.test(value);
    }
  },
  // 验证小数
  numTo2: function(rule, value, callback) {
    if (callback) {
      if (value && !/^\d+(?:\.\d{1,2})?$/.test(value)) {
        return callback(new Error("请输入数字最多两位小数"));
      }
      callback();
    } else {
      return /^\d+(?:\.\d{1,2})?$/.test(value);
    }
  },
  // 验证手机号
  phone: (rule, value, callback) => {
    if (callback) {
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        return callback(new Error("手机格式不正确"));
      }
      callback();
    } else {
      return /^1[3-9]\d{9}$/.test(value);
    }
  },
  // 验证身份证
  idCard: function(rule, value, callback) {
    if (callback) {
      if (
        value &&
        !/^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX])$/.test(value)
      ) {
        return callback(new Error("身份证格式不正确"));
      }
      callback();
    } else {
      return /^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX])$/.test(value);
    }
  },
  // 验证链接
  urlOk: function(rule, value, callback) {
    if (callback) {
      if (value && !/^http(s)?:\/\//.test(value)) {
        return callback(new Error("链接格式不正确"));
      }
      callback();
    } else {
      return /^http(s)?:\/\//.test(value);
    }
  },
  download(content, fileName) {
    const blob = new Blob([content]);
    const a = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    const filename = fileName;
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
