
//todo 支持内容html模板

$.fn.counter = function(cfg){
    var self = $(this);
    var conf = $.extend({
        format: function(day,hour,minute,second){
            return day+'天'+hour+'时'+minute+'分'+second+'秒';
        },
        container: $(this).find('span'),
        destString: $(this).find('span').attr('data-date')
    }, cfg);
    var container  = conf.container;
    var dest = conf.destString * 1000;
    var intDiff = parseInt(dest - (new Date()).getTime())/1000;

    var counter = function(){
        var day=0,
            hour=0,
            minute=0,
            second=0;//时间默认值
        if (intDiff > 0) {
            day = Math.floor(intDiff / (60 * 60 * 24));
            hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (hour <= 9) hour = '0' + hour;
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        container.html(conf.format(day,hour,minute,second));
        intDiff--;
    };
    counter();
    self.show();
    setInterval(counter, 1000);
};