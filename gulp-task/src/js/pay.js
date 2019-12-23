+function($) {
  'use strict';
  $.fn.transitionEnd = function(callback) {
    var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
      i, dom = this;

    function fireCallBack(e) {
      /*jshint validthis:true */
      if (e.target !== this) return;
      callback.call(this, e);
      for (i = 0; i < events.length; i++) {
        dom.off(events[i], fireCallBack);
      }
    }

    if (callback) {
      for (i = 0; i < events.length; i++) {
        dom.on(events[i], fireCallBack);
      }
    }
    return this;
  };

  var show = function(html, className) {
    var className = className || 'weui-toast--text';
    $('<div class=\'weui-mask_transparent\'></div>').appendTo(document.body);
    var tpl = '<div class="weui-toast ' + className + '">' + html + '</div>';
    var dialog = $(tpl).appendTo(document.body);

    dialog.addClass('weui-toast--visible');
    dialog.show();
  };
  var hide = function() {
    $('.weui-mask_transparent').remove();
    var done = false;
    var $el = $('.weui-toast--visible').removeClass('weui-toast--visible').transitionEnd(function() {
      var $this = $(this);
      $this.remove();
      done = true;
    });

    setTimeout(function() {
      if (!done) {
        $el.remove();
      }
    }, 1000);
  };
  $.toast = function(text, time) {
    show(text);
    time = time || 1500;
    setTimeout(function() {
      hide();
    }, time);
  };
  $.modal = function(params, onOpen) {
    params = $.extend({}, defaults, params);


    var buttons = params.buttons;

    var buttonsHtml = buttons.map(function(d, i) {
      return '<a href="javascript:;" class="weui-dialog__btn ' + (d.className || '') + '">' + d.text + '</a>';
    }).join('');

    var tpl = '<div class="weui-dialog">' +
      '<div class="weui-dialog__hd"><strong class="weui-dialog__title">' + params.title + '</strong></div>' +
      (params.text ? '<div class="weui-dialog__bd">' + params.text + '</div>' : '') +
      '<div class="weui-dialog__ft">' + buttonsHtml + '</div>' +
      '</div>';

    var dialog = $.openModal(tpl, onOpen);

    dialog.find('.weui-dialog__btn').each(function(i, e) {
      var el = $(e);
      el.click(function() {
        //先关闭对话框，再调用回调函数
        if (params.autoClose) $.closeModal();

        if (buttons[i].onClick) {
          buttons[i].onClick.call(dialog);
        }
      });
    });

    return dialog;
  };

  $.openModal = function(tpl, onOpen) {
    var mask = $('<div class=\'weui-mask\'></div>').appendTo(document.body);
    mask.show();

    var dialog = $(tpl).appendTo(document.body);

    if (onOpen) {
      dialog.transitionEnd(function() {
        onOpen.call(dialog);
      });
    }

    dialog.show();
    mask.addClass('weui-mask--visible');
    dialog.addClass('weui-dialog--visible');


    return dialog;
  };

  $.closeModal = function() {
    $('.weui-mask--visible').removeClass('weui-mask--visible').transitionEnd(function() {
      $(this).remove();
    });
    $('.weui-dialog--visible').removeClass('weui-dialog--visible').transitionEnd(function() {
      $(this).remove();
    });
  };
  $.confirm = function(text, title, onOK, onCancel) {
    var config;
    if (typeof text === 'object') {
      config = text;
    } else {
      if (typeof title === 'function') {
        onCancel = arguments[2];
        onOK = arguments[1];
        title = undefined;
      }

      config = {
        text: text,
        title: title,
        onOK: onOK,
        onCancel: onCancel,
      };
    }
    return $.modal({
      text: config.text,
      title: config.title,
      buttons: [
        {
          text: defaults.buttonCancel,
          className: 'default',
          onClick: config.onCancel,
        },
        {
          text: defaults.buttonOK,
          className: 'primary',
          onClick: config.onOK,
        }],
    });
  };
  var defaults = $.modal.prototype.defaults = {
    title: '提示',
    text: undefined,
    buttonOK: '确定',
    buttonCancel: '取消',
    buttons: [{
      text: '确定',
      className: 'primary',
    }],
    autoClose: true, //点击按钮自动关闭对话框，如果你不希望点击按钮就关闭对话框，可以把这个设置为false
  };
  $.showLoading = function(text) {
    var html = '<div class="weui_loading" style="' + (text ? '' : 'padding:10px') + '">';
    html += '<i class="weui-loading weui-icon_toast"></i>';
    if (text) {
      html += '<p class="weui-toast_content">' + (text) + '</p>';
    }
    html += '</div>';
    show(html, 'weui_loading_toast');
  };

  $.hideLoading = function() {
    hide();
  };
}($);
$(function() {
  $('.van-key').on('touchstart', function() {
    $(this).addClass('van-key--active');
  }).on('touchmove touchend touchcancel', function() {
    $(this).removeClass('van-key--active');
  }).on('click', function() {
    var _this = $(this), text = _this.text();
    if (isNaN(text)) {
      _this.hasClass('van-key--delete') ? setInput('delete', text) : setInput('spot', text);
    } else {
      setInput('number', text);
    }
  });
  var urlParse = getParam(), authCode, payWay;

  function init() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/Alipay/i) == 'alipay') {
      payWay = 'ALIPAY_JS';
      getAlipayUserId();
    } else if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      payWay = 'WEIXIN_PUBLIC_ACCOUNT';
      getWxOpendId();
    } else {
      return alert('请用微信或支付宝扫码');
    }
  }

  init();

  function alipayReady(callback) {
    if (window.AlipayJSBridge) {
      callback && callback();
    } else {
      document.addEventListener('AlipayJSBridgeReady', callback, false);
    }
  }

  function wxReady(callback) {
    if (window.WeixinJSBridge) {
      callback && callback();
    } else {
      document.addEventListener('WeixinJSBridgeReady', callback, false);
    }
  }

  function getWxOpendId() {
    $.showLoading();
    $.ajax({
      url: '/adminpay/api/travel/wxredirect',
      type: 'get',
      dataType: 'json',
      data: {
        code: urlParse.code,
        si: urlParse.si,
        soi: urlParse.soi,
      },
      success: function(res) {
        if (res.status === 200) {
          authCode = res.data.openid;
          initHtml(res.data);
        }
      },
      complete: function() {
        $.hideLoading();
      },
      error: function(xhr) {
        console.log(xhr);
      },
    });
  }

  function initHtml(res) {
    $('.pay-submit').removeAttr('disabled');
    $('.pay-name').text(res.storeName);
    $('.pay-img').toggle(res.imgFlag);
  }

  function getAlipayUserId() {
    $.showLoading();
    $.ajax({
      url: '/adminpay/api/travel/aliredirect',
      type: 'get',
      dataType: 'json',
      data: {
        code: urlParse.auth_code,
        si: urlParse.si,
        soi: urlParse.soi,
      },
      success: function(res) {
        if (res.status === 200) {
          authCode = res.data.userId;
          initHtml(res.data);
        }
      },
      complete: function() {
        $.hideLoading();
      },
      error: function(xhr, txt) {
        console.log(xhr);
      },
    });
  }

  function setInput(type, val) {
    var money = $('#money'), current = money.text();
    if (!current && (type === 'delete' || type === 'spot')) return;
    switch (type) {
      case 'number':
        current = current + val;
        break;
      case 'spot':
        if (current.indexOf('.') >= 0) return;
        current = current + val;
        break;
      case 'delete':
        current = current.substring(0, current.length - 1);
        break;
    }
    var moneyText = current.split('.'), moneyOther;
    if (moneyText.length === 2 && moneyText[1]) {
      moneyOther = moneyText[1].substring(0, 2);
      current = moneyText[0] + '.' + moneyOther;
    }
    money.text(current);
  }

  setInterval(function() {
    var $_inputSpan = $('.input-cursor');
    $_inputSpan.toggle();
  }, 500);

  function getParam(url) {
    if (!url) url = window.location.search.substr(1);
    var reg = /(([^?&=]+)(?:=([^?&=]*))*)/g;
    var result = {};
    url.replace(reg, function() {
      var key = arguments[2];
      var val = arguments[3] || '';
      result[key] = val;
    });
    return result;
  };
  $('.pay-submit').click(function() {
    var money = $('#money').text();
    if (!money) {
      return $.toast('请输入金额');
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(money)) {
      return $.toast('金额格式有误');
    }
    if (+money === 0) return $.toast('金额必须大于0');
    moneyPay({
      loading: $.showLoading,
      loading_wx: $.showLoading,
      data: {
        amount: +money,
        authCode: authCode,
        k: urlParse.k,
        payway: payWay,
        si: urlParse.si,
        soi: urlParse.soi,
      },
      success_wx: function(data, res_data) {
        $.toast('支付成功');
        var storeName = encodeURI(res_data.storeName);
        window.location.href = '/payment.html?tradeNo=' + res_data.tradeNo + '&amount=' + res_data.amount + '&storeName=' + storeName + '&createTime=' + res_data.createTime;
      },
    });
  });

  function moneyPay(opt) {
    var opt = opt || {};
    var fn = new Function;
    var data = opt.data;
    var loading = opt.loading || fn;
    var complete = opt.complete || fn;
    var success = opt.success || fn;
    var error = opt.error || fn;
    var timeout = opt.timeout || fn;
    var serverError = opt.serverError || fn;
    var loading_wx = opt.loading_wx || fn;
    var complete_wx = opt.complete_wx || fn;
    var success_wx = opt.success_wx || fn;
    var cancel_wx = opt.cancel_wx || fn;
    var fail_wx = opt.fail_wx || fn;
    var error_wx = opt.error_wx || fn;
    var url = '/adminpay/api/travel/scanPay';
    $.ajax({
      url: url,
      type: 'post',
      //dataType: 'json',
      processData: false,
      contentType: 'application/json',
      data: JSON.stringify(data),
      beforeSend: function() {
        loading();
      },
      success: function(res) {
        var res = res || {},
          status = +res.status
          , msg = res.msg || '支付失败，请重新支付'
          , res_data = res.data;
        $.hideLoading();
        if (status === 200) {
          loading_wx('正在支付中');
          if (payWay === 'WEIXIN_PUBLIC_ACCOUNT') {
            wxReady(function() {
              WeixinJSBridge.invoke('getBrandWCPayRequest', res_data, function(data) {
                $.hideLoading();
                complete_wx(data);
                if (data.err_msg == 'get_brand_wcpay_request:ok') {
                  success_wx(data, res_data);
                } else if (data.err_msg == 'get_brand_wcpay_request:cancel') {
                  $.toast('您取消了支付，支付成功后订单才会生效哦~');
                  cancel_wx(data);
                } else if (data.err_msg == 'get_brand_wcpay_request:fail') {
                  $.toast('系统错误,请重新支付');
                  error_wx(data);
                } else {
                  $.toast('支付失败，失败原因：' + data.err_msg);
                  fail_wx(data);
                }
              });
            });
          } else {
            alipayReady(function() {
              AlipayJSBridge.call('tradePay', res_data, function(result) {
                $.hideLoading();
                var code = result.resultCode;
                if (code === '9000') {
                  success_wx(data, res_data);
                } else if (code === '6001' || code === '7001' || code === '99') {
                  $.toast('您取消了支付，支付成功后订单才会生效哦~');
                  cancel_wx(data);
                } else if (code === '4000') {
                  $.toast('系统错误,请重新支付');
                  error_wx(data);
                } else {
                  $.toast('支付失败，失败原因：' + data.err_msg);
                  fail_wx(data);
                }
              });
            });
          }
          success(res);
        } else {
          error(msg);
          $.toast(msg);
        }
      },
      error: function(xhr, txt) {
        $.hideLoading();
        if (txt === 'timeout') {
          timeout();
        } else {
          serverError();
        }
      },
    });
  }
});
