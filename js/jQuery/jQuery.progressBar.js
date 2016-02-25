/**
 * jquery progress bar plugin
 *
 */

(function($){
    var progressBar = function($element, percent){
        var progressBarWidth, tmp;
        //若只传入一个参数，则为进度；
        if (!percent) {
            percent = $element;
            $element = $(this);
        }

        //校验percent 的有效性,并提供默认值 100%
        tmp = parseFloat(percent);
        if (!(tmp > 0 && tmp <= 100)) {
            percent = 100;
        }

        progressBarWidth = percent * $element.width() / 100;
        $element.find('div').animate({width: progressBarWidth}, 500).html(percent + "%");
    }

    $.fn.progressBar = $.progressBar =  progressBar;
})(jQuery);
