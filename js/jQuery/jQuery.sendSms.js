$.fn.sendSms = function(cfg) {
    cfg = $.extend({
        time: 60,
        autoStart: !0,
        recentText: "重新发送",
        target: null
    }, cfg);
    var self = this;//这里的this会指向调用的jquery元素
    var targetItem = !!cfg.target ? $(cfg.target) : self;
    var explain = targetItem.find('.ui-form-explain');
    self.attr("disabled", "disabled").removeClass("btn-orange").addClass("btn-gray");
    explain.text("验证码已发送到您的手机上。");
    var timer = null,
        start = function() {
            0 != cfg.time ? timer = setTimeout(function() {
                cfg.time--;
                self.val("重新发送("+ cfg.time +")");
                self.attr('counting','yes');
                start();
            }, 1000) : (self.val(cfg.recentText), self.removeAttr("disabled").removeClass("btn-gray").addClass("btn-orange"), self.siblings(".ui-form-explain").text(""));
        };
    cfg.autoStart && start();
    var sendSms = {
        start: function() {
            start();
        },
        clear: function(msg) {
            clearTimeout(timer);
            self.val("获取验证码");
            self.removeAttr('counting');
            self.removeAttr("disabled").removeClass("bt-gray").addClass("btn-orange");
            if (msg) {
                targetItem.addClass('ui-form-item-error');
                explain.text(msg)
            } else {
                explain.text("请重试");
            }
        }
    };
    return sendSms;
}