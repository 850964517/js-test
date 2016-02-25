/**
 *
 * 注册页面的token加密算法
 *
 * 使用方式：在sign-up的css文件中添加class为sign-up-double-code的样式，并指明background的url，为images目录中1x1像素的图片
 *
 * 该url为相对于静态服务器绝对地址的相对路径，与后端约定为公钥，拼接在phone后面，生成token，更新到 cookie TZLSVRID 中
 *
 *
 */

var Cookie = require('libs/arale/cookie/1.0.2/cookie.js');
require('libs/blueimp/md5/1.1.0/signup.js');




$(function(){
    var dom =  $('<div/>').addClass('none').addClass('sign-up-double-code');
    if ($('.wrapper').length > 0) {
        dom.appendTo('.wrapper');
    } else {
        dom.appendTo('body');
    }
    Cookie.set('TZLSVRID', $.signcode(dom.css('background-image')));
    //加密方法
    $.fn.signup = function(){
        Cookie.set('TZLSVRID', $.signcode(this.val() + $('.sign-up-double-code').css('background-image')));
    };

});