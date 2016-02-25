/**
 * 动态数字插件
 */
function AnimateNum(settings) {
    this.obj = settings.obj;
    this.target = settings.target.toString();
    this.targetString = settings.targetString.toString();
    this.totalTime = settings.totalTime || 1000;
    this.init();
}

AnimateNum.prototype = {
    init: function() {
        if(!this.target) return false;
        this.animation();
    },
    animation: function() {
        var self = this;
        var fixIndex = this.target.indexOf("."); //小数点索引
        var fixLength = 0; //小数点后有几位
        if(fixIndex >= 0) {
            fixLength = this.target.length - fixIndex - 1;
        }
        var target = this.target.replace("\.", "");
        var totalStep = (this.totalTime / 30) | 0;
        var stepLength = target / totalStep | 0;
        var currentStep = 0;
        var currentNum = 0;
        self.timer = setInterval(function() {
            currentStep++;
            currentNum += stepLength
            self.obj.html(currentNum / Math.pow(10, fixLength));
            if(currentStep >= totalStep) {
                clearInterval(self.timer);
                self.obj.html(self.targetString);
            }
        }, 30)
    }
}

$.fn.animateNum = function() {
    var self = $(this);
    var winRange = {
        top: $(window).scrollTop(),
        bottom: $(window).scrollTop() + $(window).height()
    };
    var targetNum = self.attr('data-animateTarget');
    var targetString = self.attr('data-animateTargetString') || targetNum;
    if(winRange.top <= ($(this).offset().top + $(this).height()) && winRange.bottom >= $(this).offset().top && !$(this).data("start")) {
        self.data("start", true);
        new AnimateNum({
            obj: self,
            target: targetNum,
            targetString: targetString,
            totalTime: 1000
        })
    }
}