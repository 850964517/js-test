/**
 *
 * 百度统计代码
 *
 */


$.fn.track = function(cfg){
    var self = $(this);
    var conf = $.extend({
        category: '默认类别',
        action: 'click',
        label: '行为统计',
        value: '无'
    }, cfg);

    //暂时只支持事件统计

    self.on('mousedown', function(){
        window['_hmt'] = window['_hmt'] || [];
        window['_hmt'].push(['_trackEvent', conf.category, conf.action, conf.label, conf.value]);
    });
}