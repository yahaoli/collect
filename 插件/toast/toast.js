+ function($) {
    "use strict";
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

    var show = function(html,className) {
        var className = className || "weui-toast--text";
        $("<div class='weui-mask_transparent'></div>").appendTo(document.body);
        var tpl = '<div class="weui-toast '+className+'">' + html + '</div>';
        var dialog = $(tpl).appendTo(document.body);

        dialog.addClass("weui-toast--visible");
        dialog.show();
    };
    var hide = function() {
        $(".weui-mask_transparent").remove();
        var done = false;
        var $el = $(".weui-toast--visible").removeClass("weui-toast--visible").transitionEnd(function() {
            var $this = $(this);
            $this.remove();
            done = true
        });

        setTimeout(function () {
            if (!done) {
                $el.remove()
            }
        }, 1000)
    }
    $.toast = function(text,type, time) {
      var html = text;
      if (type === 'success') {
        html = '<div class="weui_success">';
        html += '<svg width="90px" class="weui-success weui-icon_toast" height="90px" viewBox="0 0 90 90" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
          '        <g id="-X-PAY" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" fill-opacity="0.8">\n' +
          '            <g transform="translate(-330.000000, -496.000000)" fill="#FFFFFF" fill-rule="nonzero">\n' +
          '                <g id="succeed" transform="translate(330.000000, 496.000000)">\n' +
          '                    <path d="M45,0 C20.1471863,-1.52179594e-15 3.04359188e-15,20.1471863 0,45 C-3.04359188e-15,69.8528137 20.1471863,90 45,90 C69.8528137,90 90,69.8528137 90,45 C90,33.065258 85.2589422,21.6193319 76.8198052,13.1801948 C68.3806681,4.74105782 56.934742,7.30792182e-16 45,0 Z M70.6919856,31.1124402 L39.5580144,62.9246412 C39.4508135,63.0867675 39.3282372,63.2381851 39.1919856,63.3767942 C38.6189512,63.9630945 37.836394,64.2976151 37.0166173,64.3067013 C36.1968406,64.3157875 35.4070611,63.9986943 34.8211723,63.4252393 L34.7727273,63.3767942 L19.3080144,47.6698564 C18.1014732,46.4187366 18.1014732,44.4371246 19.3080144,43.1860048 C19.8812551,42.5980609 20.6649595,42.2624909 21.4860566,42.2534013 C22.3071536,42.2443116 23.0980947,42.5624501 23.6842105,43.1375598 L23.7326555,43.1860048 L36.9419856,56.5998804 L66.2781101,26.6232058 C66.8511445,26.0369055 67.6337016,25.7023849 68.4534784,25.6932987 C69.2732551,25.6842125 70.0630346,26.0013057 70.6489234,26.5747607 L70.6973684,26.6232058 C71.9073743,27.875013 71.9073743,29.860633 70.6973684,31.1124402 L70.6919856,31.1124402 Z" id="Shape"></path>\n' +
          '                </g>\n' +
          '            </g>\n' +
          '        </g>\n' +
          '    </svg>';
        if (text) {
          html += '<p class="weui-toast_content">' + (text) + '</p>';
        }
        html += '</div>';
      }

      show(html);
      time = time || 1500;
      // setTimeout(function() {
      //   hide();
      // }, time);
    }
    $.modal = function(params, onOpen) {
        params = $.extend({}, defaults, params);


        var buttons = params.buttons;

        var buttonsHtml = buttons.map(function(d, i) {
            return '<a href="javascript:;" class="weui-dialog__btn ' + (d.className || "") + '">' + d.text + '</a>';
        }).join("");

        var tpl = '<div class="weui-dialog">' +
            '<div class="weui-dialog__hd"><strong class="weui-dialog__title">' + params.title + '</strong></div>' +
            ( params.text ? '<div class="weui-dialog__bd">'+params.text+'</div>' : '')+
            '<div class="weui-dialog__ft">' + buttonsHtml + '</div>' +
            '</div>';

        var dialog = $.openModal(tpl, onOpen);

        dialog.find(".weui-dialog__btn").each(function(i, e) {
            var el = $(e);
            el.click(function() {
                //先关闭对话框，再调用回调函数
                if(params.autoClose) $.closeModal();

                if(buttons[i].onClick) {
                    buttons[i].onClick.call(dialog);
                }
            });
        });

        return dialog;
    };

    $.openModal = function(tpl, onOpen) {
        var mask = $("<div class='weui-mask'></div>").appendTo(document.body);
        mask.show();

        var dialog = $(tpl).appendTo(document.body);

        if (onOpen) {
            dialog.transitionEnd(function () {
                onOpen.call(dialog);
            });
        }

        dialog.show();
        mask.addClass("weui-mask--visible");
        dialog.addClass("weui-dialog--visible");


        return dialog;
    }

    $.closeModal = function() {
        $(".weui-mask--visible").removeClass("weui-mask--visible").transitionEnd(function() {
            $(this).remove();
        });
        $(".weui-dialog--visible").removeClass("weui-dialog--visible").transitionEnd(function() {
            $(this).remove();
        });
    };
    $.confirm = function(text, title, onOK, onCancel) {
        var config;
        if (typeof text === 'object') {
            config = text
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
                onCancel: onCancel
            }
        }
        return $.modal({
            text: config.text,
            title: config.title,
            buttons: [
                {
                    text: defaults.buttonCancel,
                    className: "default",
                    onClick: config.onCancel
                },
                {
                    text: defaults.buttonOK,
                    className: "primary",
                    onClick: config.onOK
                }]
        });
    };
    var defaults = $.modal.prototype.defaults = {
        title: "提示",
        text: undefined,
        buttonOK: "确定",
        buttonCancel: "取消",
        buttons: [{
            text: "确定",
            className: "primary"
        }],
        autoClose: true //点击按钮自动关闭对话框，如果你不希望点击按钮就关闭对话框，可以把这个设置为false
    };
    $.showLoading = function(text) {
      var html = '<div class="weui_loading" style="'+(text?'':'padding:10px')+'">';
      html += '<i class="weui-loading weui-icon_toast"></i>';
      if(text){
        html += '<p class="weui-toast_content">' + (text) + '</p>';
      }
      html += '</div>';
      show(html, 'weui_loading_toast');
    }

    $.hideLoading = function() {
        hide();
    }
}($);
