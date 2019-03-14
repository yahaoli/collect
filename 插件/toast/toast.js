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
    $.toast = function(text, time) {
        show(text);
        time=time||1500
        setTimeout(function() {
            hide();
        }, time);
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
        var html = '<div class="weui_loading">';
        html += '<i class="weui-loading weui-icon_toast"></i>';
        html += '</div>';
        show(html, 'weui_loading_toast');
    }

    $.hideLoading = function() {
        hide();
    }
}($);