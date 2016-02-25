//传入元素和配置，生成相关的提示
//结合tips,进行当前金额状态的提示,
//具体金额信息的提示，在invest-input-tip里面

var Tip = require('libs/arale/tip/1.2.2/tip.js');

$.fn.invest = function(cfg) {
    var conf = $.extend(true,{
        min: 100,
        max: parseInt($(this).attr('data-balance'), 10),
        interest: parseInt($(this).attr('data-interest'), 10),//收益率乘以1000之后的数字
        days: parseInt($(this).attr('data-days'), 10),//计息天数,默认使用天
        base: 360,//计息基数，一年按照360天算，还是365天，需要确定，英国法365/365;大陆法360/360;欧罗法365/360;闰年做相应处理
        portion: 100,//每一份的大小，默认为1000元，若不设置，以最小份额为准
        balance: 0,
        user_balance: 0,//用户账户余额，校验需要充值多少钱
        needTip: true,
        recharge_url: '/recharge_record/recharge',
        project_id: 0,
        coupon_data: null,
        tip: {}
    }, cfg);

    var self = $(this);
    var tip = null;

    var initTip = function(content){
        var width = self.outerWidth(),
            height = self.outerHeight();

        tip = new Tip($.extend(true, {
            trigger: self,
            triggerType: 'focus',
            content: content,
            align: {
                selfXY: [0 , height],
                baseXY: [0, 0]
            },
            effect: 'fade',
            arrowPosition: 7
        }, conf.tip)).render()._setPosition();
    };

    var showTip = function(){
        $('.ui-poptip').fadeIn();
    };

    var hideTip = function(){
        $('.ui-poptip').hide()
    };

    var setTip = function(list){
        //根据传入的数组，设置class,[1,1,0]表示[success,success,error],如果传入非0,1之外的值，则显示默认样式

        //todo 只显示一条出错信息
        $('.ui-poptip,.ui-poptip-content div').hide();
        $.each(list, function(k,v){
            if (v == 1) {
                $('.ui-poptip-content i').eq(k).addClass('invest-tip-icon-success').removeClass('invest-tip-icon-error');
                $('.ui-poptip-content span').eq(k).addClass('invest-tip-success').removeClass('invest-tip-error');
            } else if (v == 0) {
                $('.ui-poptip-content i').eq(k).removeClass('invest-tip-icon-success').addClass('invest-tip-icon-error');
                $('.ui-poptip-content span').eq(k).removeClass('invest-tip-success').addClass('invest-tip-error');
                $('.ui-poptip').show();
                $('.ui-poptip-content div').eq(k).show();
            } else {
                $('.ui-poptip-content i').eq(k).removeClass('invest-tip-icon-success').removeClass('invest-tip-icon-error');
                $('.ui-poptip-content span').eq(k).removeClass('invest-tip-success').removeClass('invest-tip-error');
            }

            //红包单独处理,
            if (k == 4 && v == 1 ) {
                $('.ui-poptip-content i').eq(k).addClass('invest-tip-icon-success').removeClass('invest-tip-icon-error');
                $('.ui-poptip-content span').eq(k).addClass('invest-tip-success').removeClass('invest-tip-error');
                $('.ui-poptip').show();
                $('.ui-poptip-content div').eq(k).show();
            }

        });
    };

    var genrateTip = function(){
        //最小金额，递增区间，最高金额。递增区间默认为最小金额
        var min = conf.min,
            portion = conf.portion || conf.min,
            max = conf.max,
            user_balance = conf.user_balance,
            recharge_url = conf.recharge_url,
            tmplStr = ['<div><i class="invest-tip-icon"></i><span>输入金额需要为{{portion}}元的整数倍</span></div>',
                '<div class="hide"><i class="invest-tip-icon"></i><span>最低投资金额为{{min}}元</span></div>',
                '<div class="hide"><i class="invest-tip-icon"></i><span>最高投资金额为{{max}}元</span></div>',
                '<div class="hide"><i class="invest-tip-icon"></i><span>您的账户余额为{{user_balance}}元 去 <a id="to-recharge" class="clr-blue" href="' + recharge_url + '">充值</a></span></div>',
                '<div class="hide"><i class="invest-tip-icon"></i><span id="avaliable-coupon" data-amount="0">本次投资可用红包0元</span></div>'].join('');
        return tmplStr.replace('{{portion}}', portion).replace('{{max}}', max).replace('{{min}}', min).replace('{{user_balance}}', user_balance);
    };

    //todo 收益计算函数，在确定计息方式之后，注意修改
    var getProfit = function(invest){
        var interest = conf.interest,
            days = conf.days,
            base = conf.base;
        var profit = parseInt(invest, 10)*interest*days/base/10000;
        //注意利率是取的整数
        return profit.toFixed(2);
    };

    //用于检测条件是否满足,

    //todo 需要重构

    var check = function() {
        var needTip = conf.needTip;
        var min = parseInt(conf.min, 10);
        var portion = conf.portion || min;
        var max = parseInt(conf.max, 10);
        var user_balance = parseInt(conf.user_balance, 10);
        //var invest = isNaN(parseInt(self.val(), 10)) ? 0 : parseInt(self.val(), 10);
        var invest = self.val();
        var base_url = conf.recharge_url;
        var project_id = conf.project_id;
        var coupon_data = conf.coupon_data;
        var url;
        var coupon_amount = 0;
        var coupon_max = invest*0.02;
        var status = false;
        var coupon_status = false;
        if (!/^[\d]+$/.test(invest) || !(invest%portion===0)) {
            needTip && setTip([0,2,2,2]);
            showTip();
            return false;
        }
        //判断最低金额的时候将invest的值转化一下
        var invest = isNaN(parseInt(self.val(), 10)) ? 0 : parseInt(self.val(), 10);
        if (invest < min) {
            needTip && setTip([1,0,1,2]);
            showTip();
            return false;
        }

        //可以使用的红包金额，注意，红包不属于限制条件，不应处理status

        //后端传回的Object为倒序的，遍历到第一个退出即可

//        if (!!coupon_data) {
        if ($('#is-fresh').length > 0 && $('#is-fresh').attr('data-is-fresh') == 1) {
            $('#avaliable-coupon').html('该项目为新手项目不可以使用红包').attr('data-amount', 0);
        } else {
            /*
             if ($('#is-fresh').length > 0 && $('#is-fresh').attr('data-is-fresh') == 1 && coupon_max > 100) {
             coupon_max = 100;
             }
             */
            $.each(coupon_data, function (k, v) {
                // 红包总金额
                var amount = parseInt(v.amount, 10);
                if (amount <= coupon_max) {
                    coupon_amount += amount;
                    coupon_max -= amount;
                }
            });

//                if (coupon_amount > 0) {
            coupon_status = true;

            $('#avaliable-coupon').html('投资' + invest + '元最高可使用红包' + invest * 2 / 100 + '元').attr('data-amount', coupon_amount);

//                    });
//                }
        }
//        }

        if (invest > max) {
            needTip && setTip([1,1,0,2]);
            showTip();
            return false;
        } else {
            needTip && setTip([1,1,1,1,1]);
            showTip();
            status = true;
        }

        var count = parseInt(invest/portion, 10);
        var profit = getProfit(invest);
        var html = '投资' + invest + '元，预期收益￥' + profit;
        //var html = '投资' + count + '份，预期收益￥' + profit;
        //设置invest-input-tip
        self.parent().siblings('.invest-input-tip').html(html);
        return status;
    };

    conf.needTip && initTip(genrateTip());

    //绑定键盘事件
    $(this).on('keydown', function(e){
        if (e.keyCode==32) {
            e.preventDefault();
            return false;
        }
    });

    $(this).on('keyup', function(e){
        check();
    });

    tip.after('show', function(){
        check();
    });

    //暴露api
    return {
        check: check,
        profit: function(){
            return getProfit(self.val());
        }
    };

};
